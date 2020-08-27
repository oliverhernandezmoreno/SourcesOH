import logging

import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from django.utils import timezone

from api.v1.serializers.form_serializers import ReportFormInstanceHandlerSerializer, ReportFormRequestSerializer
from documents.serializers import DocumentMessageSerializer
from remotes.dispatch import handler, send_simple_message
from remotes.models import Message, Remote
from reportforms.models import ReportFormInstance, ReportForm, ReportFormVersion, FormInstanceRequest

logger = logging.getLogger(__name__)


def upload_form_documents_to_smc(form_instance):
    """Upload a file to the SMC s3 storage

    :param form_instance: FormInstance whose Document will be uploaded to SMC
    :return: Serialized list of Document with paths to files in SMC storage
    """

    s3_smc = boto3.client(
        's3',
        aws_access_key_id=settings.SMC_S3_ACCESS_KEY_ID,
        aws_secret_access_key=settings.SMC_S3_SECRET_ACCESS_KEY,
        endpoint_url=settings.SMC_S3_ENDPOINT_URL
    )

    bucket = settings.SMC_S3_BUCKET_NAME
    documents = []
    for doc in form_instance.documents.all():
        new_path = f'tmp/form_instance/{form_instance.id}/{doc.name}'
        try:
            s3_smc.upload_fileobj(doc.file.file, bucket, new_path)
        except ClientError as e:
            logging.error(e)
        doc_data = DocumentMessageSerializer(doc).data
        doc_data['file'] = new_path
        documents.append(doc_data)
    return documents


def get_form_instance_message(form_instance, command):
    if settings.STACK_IS_SML:
        exchange = settings.SMC_AMQP_EXCHANGE
    else:
        exchange = form_instance.target.remote.exchange
    body = ReportFormInstanceHandlerSerializer(form_instance).data

    if command == "form.form_instance.answer.update":
        body['documents'] = upload_form_documents_to_smc(form_instance)

    message = Message.objects.create(
        command=command,
        body=body,
        exchange=exchange,
    )
    return message


@handler("form.form_instance.create")
def form_instance_create(message, send):
    """
    Handle creation of a form instance
    Sent from SMC to SML
    """
    version_data = message.body.pop('version')
    form_data = version_data.pop('form')

    form, _ = ReportForm.objects.get_or_create(id=form_data['id'], defaults=form_data)
    version, _ = ReportFormVersion.objects.get_or_create(id=version_data['id'], defaults=version_data, form=form)

    serializer = ReportFormInstanceHandlerSerializer(data=message.body)
    if serializer.is_valid():
        instance_id = message.body['id']
        if message.body['state'] == ReportFormInstance.State.NEW_SENDING:
            serializer.save(id=instance_id, version=version, state=ReportFormInstance.State.OPEN)
        else:
            serializer.save(id=instance_id, version=version)
        status = 201
    else:
        status = 400
    response = message.make_response(
        command="form.form_instance.create.ack",
        body={'id': message.body['id'], 'status': status})
    send(response)


@handler("form.form_instance.create.ack")
def form_instance_create_ack(message, send):
    """
    Handle ack of new form instance.
    Sent automatically from SML to SMC after form.form_instance.create
    """
    if int(message.body['status']) == 201:
        instance = ReportFormInstance.objects.get(id=message.body['id'])
        instance.state = ReportFormInstance.State.NEW_SENT
        instance.save()
    # TODO handle error status


def add_documents(form_instance, docs, sml_bucket):
    """Move SML uploaded files to SMC bucket and add the respective Document to form_instance.documents

    :param form_instance: FormInstance whose Document is being handled
    :param docs: List of serialized Document uploaded by a SML
    :param docs: SML bucket in SMC storage
    """
    s3_smc = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        endpoint_url=settings.AWS_S3_ENDPOINT_URL
    )
    new_folder = f'documents/form_instance/{form_instance.id}'
    bucket = settings.AWS_STORAGE_BUCKET_NAME

    for doc_data in docs:
        new_path = f'{new_folder}/{doc_data["name"]}'

        # check serialized data
        serializer = DocumentMessageSerializer(data=doc_data)

        if not serializer.is_valid():
            # ignore if serialized data is not valid
            continue

        # move file
        file_copy_ok = False
        try:
            res_cop = s3_smc.copy_object(
                Bucket=bucket, Key=new_path, CopySource={'Bucket': sml_bucket, 'Key': doc_data['file']}
            )
            file_copy_ok = res_cop['ResponseMetadata']['HTTPStatusCode'] == 200
        except ClientError as e:
            logging.error(e)

        try:
            # delete file even if copy fails because no one will use it after this handler
            s3_smc.delete_object(Bucket=sml_bucket, Key=doc_data['file'])
        except ClientError as e:
            logging.error(e)

        # save and add to instance collection
        if file_copy_ok:
            doc = serializer.save(folder=new_folder, file=new_path)
            form_instance.documents.add(doc)


@handler("form.form_instance.answer.update")
def form_instance_answer_update(message, send):
    """
    Handle form instance answer update, sent from SML to SMC.
    """
    status = 400
    instance = None
    try:
        instance = ReportFormInstance.objects.get(id=message.body['id'])
    except ReportFormInstance.DoesNotExist:
        status = 404
    now = timezone.now()
    if instance is not None:
        docs = message.body.pop('documents') or []
        serializer = ReportFormInstanceHandlerSerializer(instance, data=message.body)
        if serializer.is_valid():
            new_instance = serializer.save(state=ReportFormInstance.State.ANSWER_RECEIVED, received_at=now)
            try:
                remote = Remote.objects.get(namespace=message.origin)
                add_documents(new_instance, docs, remote.bucket)
            except Remote.DoesNotExist:
                pass
            status = 200
    response = message.make_response(
        command="form.form_instance.answer.update.ack",
        body={'id': message.body['id'], 'status': status, 'received_at': now.isoformat()})
    send(response)


@handler("form.form_instance.answer.update.ack")
def form_instance_answer_update_ack(message, send):
    """
    Handle ack of form instance answer update.
    Sent automatically from SMC to SML after handling form.form_instance.answer.update
    """
    if int(message.body['status']) == 200:
        instance = ReportFormInstance.objects.get(id=message.body['id'])
        instance.state = ReportFormInstance.State.ANSWER_SENT
        instance.received_at = message.body['received_at']
        instance.save()


@handler('form.form_instance.request')
def form_instance_request(message, send):
    """
    Handle creation of a form instance request
    Sent from SML to SMC
    """
    serializer = ReportFormRequestSerializer(data=message.body)
    if serializer.is_valid():
        request_id = message.body['id']
        serializer.save(id=request_id)


def handle_instance_request_response(request_instance, old_instance):
    if request_instance.state == FormInstanceRequest.State.ACCEPTED:
        # create new form_instance from old instance
        state_open = ReportFormInstance.State.OPEN
        state_sending = ReportFormInstance.State.NEW_SENDING
        state = state_open if old_instance.target.remote is None else state_sending
        new_instance = ReportFormInstance.objects.create(
            version=old_instance.version,
            trimester=old_instance.trimester,
            year=old_instance.year,
            state=state,
            target=old_instance.target
        )
        request_instance.new_instance = new_instance
        request_instance.save()
        body = ReportFormInstanceHandlerSerializer(new_instance).data
    else:
        body = {}
    # send response
    if old_instance.target.remote is not None:
        send_simple_message(
            command='form.form_instance.request.response',
            body={
                "request_id": request_instance.id,
                "request_state": request_instance.state,
                **body
            },
            exchange=old_instance.target.remote.exchange
        )


@handler('form.form_instance.request.response')
def form_instance_request_response(message, send):
    request_id = message.body.pop('request_id')
    state = message.body.pop('request_state')
    request = FormInstanceRequest.objects.get(id=request_id)
    request.received_at = timezone.now()
    if state == FormInstanceRequest.State.ACCEPTED:
        request.state = FormInstanceRequest.State.ACCEPTED
        # handle new form instance as if it was a normal assignment
        form_instance_create(message, send)
        new_instance = ReportFormInstance.objects.get(id=message.body['id'])
        new_instance.save()
        request.new_instance = new_instance
    if state == FormInstanceRequest.State.REJECTED:
        request.state = FormInstanceRequest.State.REJECTED
    request.save()
