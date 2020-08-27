from rest_framework import serializers

from targets.models import VideoFrame, Camera, Target


class VideoFrameSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoFrame
        fields = ('id', 'uploaded_at', 'timestamp')


class CameraSerializer(serializers.ModelSerializer):
    video_frames = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Camera
        fields = ('id', 'created_at', 'name', 'label', 'video_frames')

    def get_video_frames(self, obj):
        frame = obj.video_frames.first()
        if frame is None:
            return []
        else:
            return [VideoFrameSerializer(frame).data]


class CameraMessageSerializer(serializers.ModelSerializer):
    target = serializers.SlugRelatedField(slug_field='canonical_name', queryset=Target.objects.all())

    class Meta:
        model = Camera
        fields = ('id', 'name', 'label', 'target')


class VideoFrameMessageSerializer(serializers.ModelSerializer):
    camera = CameraMessageSerializer(read_only=True)
    image = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = VideoFrame
        fields = ('id', 'camera', 'image', 'timestamp')

    def get_image(self, obj):
        return str(obj.image.file)
