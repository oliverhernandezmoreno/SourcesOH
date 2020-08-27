import hashlib

from django.conf import settings
from django.contrib.gis.db import models
from django.core.validators import MinLengthValidator
from django.db.models.signals import post_delete
from django.dispatch import receiver
import reversion

from base.fields import AutoUUIDField
from base.fields import MetaJSONField
from base.signals import delete_field_file


@reversion.register()
class DocumentType(models.Model):
    id = models.SlugField(max_length=255, primary_key=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.id

    class Meta:
        ordering = ['id']


def build_document_path(folder, filename):
    return '/'.join(filter(bool, [folder, filename]))


def get_document_directory(instance, filename):
    # TODO improve folder naming for indexing in s3 (?)
    return build_document_path(instance.folder, filename)


@reversion.register()
class Document(models.Model):

    id = AutoUUIDField()
    folder = models.CharField(max_length=255, editable=False, validators=[MinLengthValidator(2)])
    file = models.FileField(upload_to=get_document_directory, max_length=1020)
    type = models.ForeignKey(
        DocumentType,
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name='+',
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    sha1 = models.CharField(max_length=40)
    meta = MetaJSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=True,
        null=True,
        on_delete=models.PROTECT,
        related_name='+'
    )

    def __str__(self):
        return f'{self.folder}/{self.name}'

    def save(self, *args, **kwargs):
        signature = hashlib.sha1()
        for chunk in self.file.chunks():
            signature.update(chunk)
        self.sha1 = signature.hexdigest()
        return super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']


@receiver(post_delete, sender=Document)
def delete_file(sender, instance, *args, **kwargs):
    if instance.file is not None:
        delete_field_file(instance.file)
