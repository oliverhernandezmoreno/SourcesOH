import os

import boto3
from django.conf import settings


def delete_field_file(f):
    """Removes a django.db.models.fields.files.FieldFile instance from the
    storage, explicitly.

    """
    # Local file storage
    if settings.DEFAULT_FILE_STORAGE == 'django.core.files.storage.FileSystemStorage':
        path = f.path
        if os.path.isfile(path):
            os.remove(path)

    # S3 Storage
    if settings.DEFAULT_FILE_STORAGE == 'storages.backends.s3boto3.S3Boto3Storage':
        s3_args = {
            'aws_access_key_id': settings.AWS_ACCESS_KEY_ID,
            'aws_secret_access_key': settings.AWS_SECRET_ACCESS_KEY,
        }

        if settings.AWS_S3_ENDPOINT_URL is not None:
            s3_args['endpoint_url'] = settings.AWS_S3_ENDPOINT_URL

        s3_client = boto3.client('s3', **s3_args)

        # TODO check response and raise exception if remote delete fails
        s3_client.delete_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=f.name
        )
