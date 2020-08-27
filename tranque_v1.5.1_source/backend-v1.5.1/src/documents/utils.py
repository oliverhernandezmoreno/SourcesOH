import logging
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from django.core.files.storage import default_storage

from documents.models import Document
from documents.serializers import DocumentMessageSerializer

logger = logging.getLogger(__name__)


def get_s3_client():
    if settings.STACK_IS_SML:
        args = {
            'aws_access_key_id': settings.SMC_S3_ACCESS_KEY_ID,
            'aws_secret_access_key': settings.SMC_S3_SECRET_ACCESS_KEY,
            'endpoint_url': settings.SMC_S3_ENDPOINT_URL
        }
    else:
        args = {
            'aws_access_key_id': settings.AWS_ACCESS_KEY_ID,
            'aws_secret_access_key': settings.AWS_SECRET_ACCESS_KEY,
            'endpoint_url': settings.AWS_S3_ENDPOINT_URL
        }
    return boto3.client('s3', **args)


def file_not_exist(s3, bucket, key):
    try:
        s3.head_object(Bucket=bucket, Key=key)
    except ClientError as e:
        if e.response['Error']['Code'] == "404":
            return True
        else:
            # Something else has gone wrong.
            raise
    return False


def upload_doc(doc, s3, bucket, file_path):
    """
    Upload file to path in bucket
    if a file in that path already exists it does nothing
    """
    ok = True
    if file_not_exist(s3, bucket, file_path):
        ok = False
        try:
            if settings.STACK_IS_SML:
                s3.upload_fileobj(doc.file.file, bucket, file_path)
                ok = True
            else:
                # In a smc to keep traffic internally in the s3 storage,
                # instead of uploading the file from the backend, copy it from one bucket to another
                res_cop = s3.copy_object(Bucket=bucket, Key=file_path,
                                         CopySource={'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 'Key': str(doc.file)})
                ok = res_cop['ResponseMetadata']['HTTPStatusCode'] == 200
        except ClientError as e:
            logging.error(e)
    return ok


def serialize_docs_for_upload(documents, folder):
    """
    Serialize documents to be uploaded to a bucket
    """
    for doc in documents:
        new_path = str(Path(folder) / doc.name)
        doc_data = DocumentMessageSerializer(doc).data
        doc_data['file'] = new_path
        yield doc.id, doc, doc_data


def upload_docs(documents, bucket):
    """
    Upload documents serialized with serialize_docs_for_upload
    """
    s3 = get_s3_client()
    for _, doc, serialized_doc in documents:
        upload_doc(doc, s3, bucket, serialized_doc['file'])


def download_doc(s3, serialized_doc, bucket, folder):
    """
    Download serialized_doc[file] from bucket to folder
    if a file with serialized_doc[name] already exists in folder then it does nothing
    returns a new Document if successfully downloaded
    """
    serializer = DocumentMessageSerializer(data=serialized_doc)
    doc_path = f'{folder}/{serialized_doc["name"]}'
    if not serializer.is_valid():
        return None
    if default_storage.exists(doc_path):
        # If serializer is valid and file exists there should be a doc
        doc = Document.objects.filter(folder=folder, name=serialized_doc['name']).first()
        if doc is None:
            # if it does not exists, don't upload, just create the Document
            doc = serializer.save(folder=folder, file=doc_path)
        return doc
    else:
        # TODO In a SMC to keep traffic internally in the s3 storage
        #  instead of downloading and uploading the file copy it from one bucket to another
        new_file = default_storage.open(doc_path, mode='wb')
        s3.download_fileobj(bucket, serialized_doc['file'], new_file)
        doc = serializer.save(folder=folder, file=doc_path)
        return doc


def download_docs(documents, bucket, folder):
    """
    Download serialized documents
    """
    s3 = get_s3_client()
    for serialized_doc in documents:
        doc = download_doc(s3, serialized_doc, bucket, folder)
        if doc is not None:
            yield doc
