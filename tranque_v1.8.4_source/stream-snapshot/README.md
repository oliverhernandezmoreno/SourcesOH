# stream snapshot

This repo builds two docker images one to consume from video streams and one to take frames from a stream and post them to the backend api

## stream_consumer
Service to periodically take video frames from a stream using the [ffmpeg library](https://ffmpeg.org/),
supports the `rtsp` protocol and upload images to tranque/backend as messages through amqp and a s3 storage

A configuration file in `.yml` format is required to indicate the list of cameras to watch, it must be mounted in `/config/streams.yml`
and have the following structure
```yaml
cameras:
  - name: <camera_name>
    target: <target_canonical_name>
    host: <streaming host>
    port: <streaming port>
    protocol: <streaming protocol> # protocol only tested with rtsp
  - name: <camera2_name>
    target: <target2_canonical_name>
    host: <streaming2 host>
    port: <streaming2 port>
    protocol: <streaming2 protocol>
  ...
```
The following environment variables must be set (using the same ones set to the backend)
 - to send messages to AMQP:
   - `NAMESPACE`
   - `AMQP_HOST`
   - `AMQP_PORT`
   - `AMQP_USERNAME`
   - `AMQP_PASSWORD`
   - `AMQP_VHOST`
   - `AMQP_SSL`
 - to upload files to S3:
   - `S3_ACCESS_KEY_ID`
   - `S3_SECRET_ACCESS_KEY`
   - `S3_ENDPOINT_URL`
   - `S3_BUCKET_NAME`
And there is an optional configuration variable to set interval between frame extractions
   - `INTERVAL` # in seconds, default is 300

## fake_stream
Service to stream video files using the [VLC library](https://wiki.videolan.org/Documentation:Documentation/)

Videos to stream should be mounted in `/videos`, videos in this folder will be added to a playlist and will be played in a loop

Optional env variables used b:
- `PROTOCOL` # default `rtsp`
- `HOST` # default empty string to listen in all network interfaces
- `PORT` # port used to serve streams
- `VIDEOS_DIR` # video folder


#### Example of how to include them in a docker-compose.yml
```yaml
services:
  ...
  stream_consumer:
    image: registry.gitlab.com/inria-chile/tranque/stream-snapshot/stream_consumer
    env_file:
      - .env
    volumes:
      - ./stream_config/streams.yml:/config/streams.yml

  fake_stream:
    image: registry.gitlab.com/inria-chile/tranque/stream-snapshot/fake_stream
    volumes:
      - ./fake_videos:/videos
  ...
```