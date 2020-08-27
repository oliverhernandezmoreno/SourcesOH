import secrets

from django.core.files import File
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError

from remotes.storage import S3BucketWrapper


def get_random_name(test):
    return f'test/storage_test/{test}_{secrets.token_urlsafe(16)}.txt'


def get_random_non_existing_name(test, storage):
    ret = get_random_name(test)
    while storage.exists(ret):
        ret = get_random_name(test)
    return ret


class Command(BaseCommand):
    help = 'Tests storage upload/download between stacks'

    def log(self, verbosity):
        if verbosity > 0:
            return lambda message: self.stdout.write(message)
        return lambda *_: None

    def add_arguments(self, parser):
        parser.add_argument(
            'stack_type',
            help=' '.join([
                'Type of stack to test storage communication;',
                'sml=test sml default storage and sml bucket in smc,',
                'smc=test smc default storage and [bucket] in the smc storage',
            ]),
            choices=['sml', 'smc']
        )
        parser.add_argument(
            'bucket',
            nargs='?',
            help='Bucket to test storage with (required for smc option only)'
        )
        parser.add_argument(
            '--keep-files',
            action='store_false',
            dest='remove_files',
            help='Do not remove test files during cleanup',
        )

    def execute_test(self, log, remove_files, s3_bucket):
        test_file_path = get_random_non_existing_name('test', s3_bucket)
        log(f'Creating test file {test_file_path}')
        test_file_content = '\n'.join([
            f'random content for file {test_file_path}',
            secrets.token_urlsafe(32),
            secrets.token_urlsafe(32)
        ])
        test_file = default_storage.open(test_file_path, mode='w')
        test_file.write(test_file_content)
        test_file.close()

        upload_path = get_random_non_existing_name('upload', s3_bucket)
        log(f'Uploading test file to {upload_path} in bucket')
        upload_file = File(default_storage.open(test_file_path, mode='rb'))
        s3_bucket.upload(upload_file, upload_path)
        upload_file.close()

        if s3_bucket.exists(upload_path):
            log('Upload ok')
        else:
            log('Error uploading file')

        download_path = get_random_non_existing_name('download', s3_bucket)
        log(f'Downloading uploaded file to {download_path} in default storage')

        s3_bucket.download(upload_path, download_path)
        if default_storage.exists(download_path):
            downloaded_file = default_storage.open(download_path, 'rb')
            downloaded_content = downloaded_file.file.read().decode('utf-8')
            if downloaded_content != test_file_content:
                log('Download file content does not match with uploaded content')
            else:
                log('Download ok')
            downloaded_file.close()
        else:
            log('Error downloading file')

        if remove_files:
            log(f'Cleaning up test files')
            s3_bucket.delete(upload_path)
            default_storage.delete(test_file_path)
            default_storage.delete(download_path)

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get('verbosity', 1)
        log = self.log(verbosity)
        stack = kwargs.get('stack_type')
        bucket = kwargs.get('bucket', None)
        remove_files = kwargs.get('remove_files')

        log(f'Executing test as a {stack} stack')

        if stack == 'sml':
            s3_bucket = S3BucketWrapper(smc_bucket=True)
        elif stack == 'smc':
            if bucket is None:
                raise CommandError('bucket is required')
            s3_bucket = S3BucketWrapper(target_bucket=bucket)
        else:
            raise CommandError('unknown option')
        self.execute_test(log, remove_files, s3_bucket)
