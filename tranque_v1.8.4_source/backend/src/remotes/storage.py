import logging

import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from django.core.files.storage import default_storage

from remotes.models import Remote

logger = logging.getLogger(__name__)


def get_target_bucket(target):
    if settings.STACK_IS_SML:
        return None
    else:
        if target.remote is None:
            raise Remote.DoesNotExist()
        return target.remote.bucket


def get_s3(access, secret, endpoint, error_prefix):
    if access is None or secret is None or endpoint is None:
        logger.warning(f'Some {error_prefix} s3 storage credentials are missing')
    return boto3.client(
        's3',
        aws_access_key_id=access,
        aws_secret_access_key=secret,
        endpoint_url=endpoint
    )


def get_s3_smc_client():
    access = settings.SMC_S3_ACCESS_KEY_ID
    secret = settings.SMC_S3_SECRET_ACCESS_KEY
    endpoint = settings.SMC_S3_ENDPOINT_URL
    return get_s3(access, secret, endpoint, 'SMC')


def get_s3_local_client():
    access = settings.AWS_ACCESS_KEY_ID
    secret = settings.AWS_SECRET_ACCESS_KEY
    endpoint = settings.AWS_S3_ENDPOINT_URL
    return get_s3(access, secret, endpoint, 'local')


def get_s3_bucket(target_bucket=None):
    if settings.STACK_IS_SML:
        return S3BucketWrapper(smc_bucket=True)
    else:
        return S3BucketWrapper(target_bucket=target_bucket)


class S3WrapperError(Exception):
    pass


class S3BucketWrapper:
    """
    Wrapper of bucket in s3 to use when uploading/downloading files between a SML and its SMC
    If smc_bucket is True instance will read/write to SMC bucket defined in settings
    If smc_bucket is False instance will read/write to target_bucket in local s3 storage
    """

    def __init__(self, target_bucket=None, smc_bucket=False):
        self.smc = smc_bucket
        if smc_bucket:
            self.s3 = get_s3_smc_client()
            self.bucket = settings.SMC_S3_BUCKET_NAME
        else:
            if settings.DEFAULT_FILE_STORAGE != 'storages.backends.s3boto3.S3Boto3Storage':
                logger.warning('Default storage is not S3')
            if target_bucket is None:
                raise S3WrapperError('A bucket must be provided for local S3')
            self.s3 = get_s3_local_client()
            self.bucket = target_bucket
            self.local_bucket = settings.AWS_STORAGE_BUCKET_NAME

    def exists(self, key):
        """Check if <key> exists in <bucket>"""
        try:
            self.s3.head_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            # Something else has gone wrong.
            raise

    def upload(self, file, key):
        """
        Upload <file> to <key> in bucket
        file must be an instance of django.core.files.File
        if a file at <key> already exists it will do nothing
        """
        if self.exists(key):
            return True
        if self.smc:
            try:
                with file.open(mode='rb') as f:
                    self.s3.upload_fileobj(f, self.bucket, key)
                return True
            except ClientError as e:
                logger.error(e)
                return False
        else:
            try:
                # If using local storage to keep traffic internally in the s3 storage,
                # instead of uploading the file from the backend, copy it from one bucket to another
                res_cop = self.s3.copy_object(
                    Bucket=self.bucket,
                    Key=key,
                    CopySource={'Bucket': self.local_bucket, 'Key': str(file)}
                )
                return res_cop['ResponseMetadata']['HTTPStatusCode'] == 200
            except ClientError as e:
                logger.error(e)
                return False

    def download(self, key, to_path):
        """
        Download file at <key> in bucket to <to_path> in default storage
        if a file in <to_path> already exists it will do nothing
        """
        if default_storage.exists(to_path):
            return True
        if self.smc:
            try:
                with default_storage.open(to_path, mode='wb') as to_file:
                    self.s3.download_fileobj(self.bucket, key, to_file)
                return True
            except ClientError as e:
                logger.error(e)
                return False
        else:
            try:
                # If using local storage to keep traffic internally in the s3 storage,
                # instead of uploading the file from the backend, copy it from one bucket to another
                res_cop = self.s3.copy_object(
                    Bucket=self.local_bucket,
                    Key=to_path,
                    CopySource={'Bucket': self.bucket, 'Key': key}
                )
                return res_cop['ResponseMetadata']['HTTPStatusCode'] == 200
            except ClientError as e:
                logger.error(e)
                return False

    def delete(self, key):
        """Delete file at <key> in <bucket>"""
        self.s3.delete_object(Bucket=self.bucket, Key=key)
