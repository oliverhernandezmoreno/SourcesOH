from django.contrib import admin
from reversion.admin import VersionAdmin

from base.admin import json_enabled_form
from documents.models import Document
from documents.models import DocumentType


@admin.register(Document)
class DocumentAdmin(VersionAdmin):

    exclude = ("id", "sha1",)
    list_display = ("name", "type", "file", "created_at")
    form = json_enabled_form(Document)


@admin.register(DocumentType)
class DocumentTypeAdmin(VersionAdmin):

    list_display = ("id", "description")
