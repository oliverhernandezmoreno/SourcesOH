from unittest.mock import patch, MagicMock

from PIL.PngImagePlugin import PngImageFile
from django.conf import settings
from django.test import override_settings
from django.utils import timezone

from api.tests.base import BaseTestCase
from api.v1.handlers.camera_handlers import cameras_video_frame_new, cameras_video_frame_smc_new
from api.v1.serializers.camera_serializers import VideoFrameMessageSerializer
from documents.tests.utils import with_fake_images, mock_download_file
from remotes.models import Message, Remote
from targets.models import Camera, VideoFrame, video_frame_path

test_settings = {
    'SMC_BROKER_URL': 'test_smc_broker',
    'SMC_AMQP_EXCHANGE': 'test_sml_exchange_in_smc',
    'SMC_S3_BUCKET_NAME': 'test_sml_bucket_in_smc',
    'BROKER_URL': 'test_local_broker',
    'AMQP_FEDERATED_EXCHANGE': 'test_local_exchange'
}


@override_settings(**test_settings)
class CamerasTestCase(BaseTestCase):

    @override_settings(STACK_IS_SML=True)
    @patch('remotes.storage.S3BucketWrapper.upload')
    @patch('remotes.storage.S3BucketWrapper.download')
    @patch('remotes.dispatch.send_messages')
    @with_fake_images(count=1)
    def test_camera_new_video_frame_handler(self, send_messages, mock_download, mock_upload, fake_images):
        # setup mocks
        mock_upload.return_value = True
        mock_download.side_effect = mock_download_file
        send = MagicMock()
        # setup camera
        camera_name = "test_camera"
        camera = Camera.objects.create(name=camera_name, label=camera_name, target=self.target_object)
        image = fake_images[0]
        # setup new frame message
        msg_body = {
            'camera': camera_name,
            'target': self.target,
            'image': image,
            'timestamp': timezone.now().isoformat()
        }
        message = Message.objects.create(
            command='cameras.video_frame.new',
            body=msg_body,
            exchange=settings.AMQP_FEDERATED_EXCHANGE,
        )
        # execute handler
        cameras_video_frame_new(message, send)
        camera.refresh_from_db()
        # assert frame created
        self.assertEqual(camera.video_frames.count(), 1)
        video_frame = camera.video_frames.first()
        filename = image.split('/')[-1]
        self.assertTrue(str(video_frame.image.file).endswith(video_frame_path(self.target, camera_name, filename)))
        # validate that stored file is an image
        # fake images are stored in png format
        im = PngImageFile(video_frame.image.file)
        im.verify()

        # this messages produce no response
        send.assert_not_called()

        # assert message was sent to SMC
        mock_upload.assert_called_once()
        send_messages.assert_called_once()

        (image_fp, file_path), _ = mock_upload.call_args
        self.assertTrue(str(video_frame.image.file).endswith(str(image_fp)))

        (messages, broker_url, broker_connection_ssl), _ = send_messages.call_args
        self.assertEqual(broker_url, test_settings['SMC_BROKER_URL'])
        self.assertEqual(len(messages), 1)
        msg = messages[0]
        self.assertEqual(msg.exchange, test_settings['SMC_AMQP_EXCHANGE'])
        self.assertEqual(msg.command, 'cameras.video_frame.smc.new')
        self.assertDictEqual(msg.body, VideoFrameMessageSerializer(video_frame).data)

    @override_settings(STACK_IS_SML=False)
    @patch('remotes.storage.S3BucketWrapper.download')
    @patch('remotes.storage.S3BucketWrapper.__init__')
    @with_fake_images(count=2)
    def test_camera_new_video_frame_smc_handler(self, mock_init, mock_download, fake_images):
        # setup remote from where the object is received
        remote = Remote.objects.create(
            namespace='test',
            exchange=test_settings['SMC_AMQP_EXCHANGE'],
            bucket=test_settings['SMC_S3_BUCKET_NAME']
        )
        target = self.target_object
        target.remote = remote
        target.save()

        # setup mock
        send = MagicMock()
        mock_download.side_effect = mock_download_file
        mock_init.return_value = None

        # setup message
        # temporally create objects to serialize them and use it as message body
        camera_name = 'test_camera'
        camera = Camera.objects.create(name=camera_name, label=camera_name, target=target)
        timestamp = timezone.now().isoformat()
        video_frame = VideoFrame.objects.create(
            camera=camera,
            image=fake_images[0],
            timestamp=timestamp
        )
        body = VideoFrameMessageSerializer(video_frame).data
        # replace image that will be deleted by post_delete signal
        video_frame.image = fake_images[1]
        video_frame.save()
        video_frame.delete()
        camera.delete()

        message = Message.objects.create(
            command='cameras.video_frame.new',
            body=body,
            exchange=settings.AMQP_FEDERATED_EXCHANGE,
        )

        # execute handler
        cameras_video_frame_smc_new(message, send)

        mock_init.assert_called_once()
        _, mock_kwargs = mock_init.call_args
        self.assertIn('target_bucket', mock_kwargs)
        self.assertEqual(mock_kwargs['target_bucket'], remote.bucket)

        mock_download.assert_called_once()
        (from_path, to_path), _ = mock_download.call_args

        self.assertEqual(from_path, body['image'])
        new_camera = Camera.objects.filter(name=camera_name, target=target).first()
        self.assertIsNotNone(new_camera)
        self.assertEqual(new_camera.video_frames.count(), 1)
        new_video_frame = new_camera.video_frames.first()
        self.assertEqual(new_video_frame.timestamp.isoformat(), timestamp)
        im = PngImageFile(new_video_frame.image.file)
        im.verify()

        # this messages produce no response
        send.assert_not_called()
