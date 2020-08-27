#!/usr/bin/env python
import base64
import logging
import os
import secrets
import tempfile
import time
import uuid
from datetime import datetime

import boto3
import ffmpeg
import kombu
import pytz
import yaml

logging.basicConfig(
    format='%(asctime)s [%(levelname)-5s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S %Z',
    level=logging.WARNING
)
logger = logging.getLogger(__name__)


def get_amqp_config():
    namespace = os.environ.get("NAMESPACE", "global-namespace")
    exchange = f"federated.{namespace}"
    host = os.environ.get("AMQP_HOST", "localhost")
    port = int(os.environ.get("AMQP_PORT", "5672"))
    user = os.environ.get("AMQP_USERNAME", "guest")
    password = os.environ.get("AMQP_PASSWORD", "guest")
    vhost = (lambda vh: vh if vh.startswith("/") else f"/{vh}")(os.environ.get("AMQP_VHOST", "/"))
    ssl = os.environ.get("AMQP_SSL", "0") == "1"
    url = f"amqp://{user}:{password}@{host}:{port}{vhost}"
    return url, ssl, exchange, namespace


def get_s3_config():
    access_key = os.environ.get("S3_ACCESS_KEY_ID", None) or None
    secret_key = os.environ.get("S3_SECRET_ACCESS_KEY", None) or None
    url = os.environ.get("S3_ENDPOINT_URL", None) or None
    bucket = os.environ.get("S3_BUCKET_NAME", None) or None
    return boto3.client(
        's3',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        endpoint_url=url
    ), bucket


def upload_image_to_s3(s3, bucket, target, camera, timestamp, local_path):
    s3_path = '/'.join([
        'target',
        target,
        'camera',
        camera,
        f'{timestamp}_{secrets.token_urlsafe(4)}.jpeg'
    ])
    logger.debug(f'Uploading image to {s3_path}')
    with open(local_path, 'rb') as file:
        s3.upload_fileobj(file, bucket, s3_path)
    return s3_path


def send_amqp_message(target, camera, timestamp, s3_path, producer, namespace):
    namespace_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, namespace)
    raw_id = uuid.uuid5(namespace_uuid, secrets.token_urlsafe(32))
    message = {
        'id': base64.urlsafe_b64encode(raw_id.bytes).decode("utf-8").rstrip("="),
        'command': 'cameras.video_frame.new',
        'body': {
            'camera': camera,
            'target': target,
            'timestamp': timestamp,
            'image': s3_path
        },
        'origin': namespace,
        'created_at': timestamp,
        'extra': {},
        'response_to': None
    }
    producer.publish(message)
    logger.debug(f'Sending message {message}')


def get_camera_frame(protocol, host, port, out_file):
    try:
        video_url = f'{protocol}://{host}:{port}/'

        output = ffmpeg.overwrite_output(
            ffmpeg.input(video_url).output(out_file, vframes=1, format='image2', vcodec='mjpeg')
        )
        output.run(quiet=True)
        return True
    except ffmpeg.Error as e:
        logger.error(f'There was an error when running ffmpeg for {video_url}')
        for line in e.stderr.decode("utf-8").split('\n'):
            logger.error(f'  {line}')
    return False


def handle_cameras(cameras, s3, bucket, producer, namespace):
    for camera in cameras:
        logger.debug(camera)

        protocol = camera.get('protocol', None)
        host = camera.get('host', None)
        port = camera.get('port', None)
        target = camera.get('target', None)
        name = camera.get('name', None)
        if protocol is None or host is None or port is None or target is None or name is None:
            logger.error(f'Improperly configured {str(camera)}')
            return None

        with tempfile.TemporaryFile() as out_file:
            logger.debug(f'Getting video frame of {name} for {target}')
            if get_camera_frame(protocol, host, port, str(out_file)):
                date = datetime.now(pytz.utc)
                s3_path = upload_image_to_s3(
                    s3,
                    bucket,
                    target,
                    name,
                    date.strftime('%Y%m%d_%H%M%S'),
                    str(out_file)
                )
                send_amqp_message(target, name, date.isoformat(), s3_path, producer, namespace)


def run():
    logger.info(f'Loading config in /config/streams.yml')
    with open(f'/config/streams.yml') as config_file:
        config = yaml.load(config_file, Loader=yaml.FullLoader)
    if 'cameras' not in config or not isinstance(config['cameras'], (tuple, list)) or len(config['cameras']) < 1:
        logger.warning('No cameras found in config file')
        exit(0)
    broker_url, enable_ssl, exchange, namespace = get_amqp_config()
    s3, bucket = get_s3_config()
    with kombu.Connection(broker_url, ssl=enable_ssl) as conn:
        producer = kombu.Producer(
            conn,
            exchange=kombu.Exchange(exchange, type="fanout")
        )
        handle_cameras(config['cameras'], s3, bucket, producer, namespace)
    logger.info(f'Done')


if __name__ == '__main__':
    interval = int(os.environ.get("INTERVAL", 300))
    logger.info(f'Setup to watch stream every {interval} seconds')
    while True:
        try:
            run()
        except Exception as e:
            logger.error('Unkown fatal error in main loop', exc_info=True)
        time.sleep(interval)
