import logging

from django.conf import settings

from api.v1.serializers.camera_serializers import VideoFrameMessageSerializer
from remotes.dispatch import handler, send_simple_smc_message
from remotes.storage import get_target_bucket, S3BucketWrapper
from targets.models import Target, Camera, video_frame_path

logger = logging.getLogger(__name__)


def upload_video_frame_to_smc_s3(video_frame, file_path):
    s3_bucket = S3BucketWrapper(smc_bucket=True)
    return s3_bucket.upload(video_frame.image, file_path)


def upload_frame_to_smc(video_frame):
    data = VideoFrameMessageSerializer(video_frame).data
    if upload_video_frame_to_smc_s3(video_frame, data['image']):
        send_simple_smc_message('cameras.video_frame.smc.new', body=data)


def download_image(from_image, target, camera, bucket):
    filename = from_image.split('/')[-1]
    to_image = video_frame_path(target, camera, filename)
    if from_image != to_image or bucket != settings.AWS_STORAGE_BUCKET_NAME:
        s3_bucket = S3BucketWrapper(target_bucket=bucket)
        s3_bucket.download(from_image, to_image)
    return to_image


@handler('cameras.video_frame.new', foreign_only=False)
def cameras_video_frame_new(message, send):
    # message.body from producer should be a dict {camera, target, timestamp, image}
    if message.origin != settings.NAMESPACE:
        # not a camera from this stack
        return
    camera_name = message.body.get('camera')
    target_canonical_name = message.body.get('target')
    from_image = message.body.get('image')
    to_image = download_image(
        from_image, target_canonical_name, camera_name, settings.AWS_STORAGE_BUCKET_NAME
    )
    serializer = VideoFrameMessageSerializer(data=message.body)
    if not serializer.is_valid():
        return
    camera = Camera.objects.get(name=camera_name, target__canonical_name=target_canonical_name)
    video_frame = serializer.save(camera=camera, image=to_image)
    if settings.STACK_IS_SML:
        upload_frame_to_smc(video_frame)


@handler('cameras.video_frame.smc.new')
def cameras_video_frame_smc_new(message, send):
    if settings.STACK_IS_SML:
        return
    # message.body from SML to SMC is VideoFrameMessageSerializer().data
    camera_data = message.body.pop('camera')
    target = Target.objects.get(canonical_name=camera_data.pop('target'))
    camera, _ = Camera.objects.get_or_create(
        target=target,
        name=camera_data['name'],
        defaults=camera_data
    )
    serializer = VideoFrameMessageSerializer(data=message.body)
    if not serializer.is_valid():
        return
    bucket = get_target_bucket(camera.target)
    image = download_image(message.body['image'], camera.target.canonical_name, camera.name, bucket)
    serializer.save(camera=camera, image=image)
