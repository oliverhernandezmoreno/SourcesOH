import logging
from pathlib import Path

from django.core.files.storage import default_storage

from documents.models import Document
from documents.serializers import DocumentMessageSerializer
from remotes.storage import get_s3_bucket

logger = logging.getLogger(__name__)


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
    s3_bucket = get_s3_bucket(target_bucket=bucket)
    for _, doc, serialized_doc in documents:
        s3_bucket.upload(doc.file, serialized_doc['file'])


def download_doc(s3_bucket, serialized_doc, folder):
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
        s3_bucket.download(serialized_doc['file'], doc_path)
        doc = serializer.save(folder=folder, file=doc_path)
        return doc


def download_docs(documents, bucket, folder):
    """
    Download serialized documents
    """
    s3_bucket = get_s3_bucket(target_bucket=bucket)
    for serialized_doc in documents:
        doc = download_doc(s3_bucket, serialized_doc, folder)
        if doc is not None:
            yield doc
