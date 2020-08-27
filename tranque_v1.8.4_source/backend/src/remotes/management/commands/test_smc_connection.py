import time

import boto3
from django.conf import settings
from django.core.management.base import BaseCommand

from remotes.dispatch import send_simple_smc_message
from remotes.handlers import random_file, SMC_CONNECTION_TEST_COMMAND
from remotes.models import Message


class Command(BaseCommand):
    help = "Tests the connection to the SMC by sending a message and expecting a response."

    def log(self, verbosity):
        if verbosity > 0:
            return lambda message: self.stdout.write(message)
        return lambda *_: None

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        log = self.log(verbosity)
        if not settings.STACK_IS_SML:
            log("The current stack is not an SML; nothing to do")
            return
        log("Creating random file in SMC bucket")
        s3_smc = boto3.client(
            "s3",
            aws_access_key_id=settings.SMC_S3_ACCESS_KEY_ID,
            aws_secret_access_key=settings.SMC_S3_SECRET_ACCESS_KEY,
            endpoint_url=settings.SMC_S3_ENDPOINT_URL
        )
        bucket = settings.SMC_S3_BUCKET_NAME
        randomfile, randompath = random_file()
        s3_smc.upload_fileobj(randomfile, bucket, randompath)
        log("Sending message to SMC")
        send_simple_smc_message(SMC_CONNECTION_TEST_COMMAND, {"file": randompath})
        message = Message.objects.filter(
            command=SMC_CONNECTION_TEST_COMMAND,
            exchange=settings.SMC_AMQP_EXCHANGE,
            origin=settings.NAMESPACE,
        ).first()
        log("Waiting about 30 seconds for response from SMC")
        for _ in range(15):
            if message.response.all().exists():
                break
            time.sleep(2)
            message.refresh_from_db()
        log(
            self.style.SUCCESS("Success!")
            if message.response.all().exists()
            else self.style.ERROR("Didn't receive response")
        )
