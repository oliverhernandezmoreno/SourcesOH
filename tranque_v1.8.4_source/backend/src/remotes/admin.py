import boto3
from django import forms
from django.conf import settings
from django.contrib import admin
from django.contrib.admin.widgets import FilteredSelectMultiple
from django.db.models import Q
from django.utils.safestring import mark_safe
from reversion.admin import VersionAdmin

from remotes.dispatch import send_simple_message
from remotes.handlers import random_file, SML_CONNECTION_TEST_COMMAND
from remotes.models import Message, EventTraceRequest, DataDumpRequest
from remotes.models import Remote
from remotes.models import VersionHash
from targets.models import Target


class RemoteForm(forms.ModelForm):
    targets = forms.ModelMultipleChoiceField(
        required=False,
        queryset=Target.objects.filter(remote__isnull=True),
        widget=FilteredSelectMultiple(verbose_name="Targets", is_stacked=False),
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance:
            self.fields["targets"].initial = self.instance.targets.all()
            self.fields["targets"].queryset = Target.objects.filter(
                Q(remote__isnull=True) | Q(remote=self.instance)
            )

    def save(self, *args, **kwargs):
        instance = super().save(*args, **kwargs)
        instance.targets.set(self.cleaned_data["targets"])
        return instance


@admin.register(Remote)
class RemoteAdmin(VersionAdmin):
    list_display = ("__str__", "bucket", "exchange", "last_seen", "has_bucket")
    readonly_fields = ("last_seen",)
    form = RemoteForm
    actions = ["test_connection", "create_bucket"]

    def test_connection(self, request, queryset):
        if settings.STACK_IS_SML:
            self.message_user(request, f"The current stack is an SML; nothing to do")
            return
        total = queryset.count()
        successful = 0
        s3_smc = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            endpoint_url=settings.AWS_S3_ENDPOINT_URL
        )
        for remote in queryset.all():
            randomfile, randompath = random_file()
            try:
                s3_smc.upload_fileobj(randomfile, remote.bucket, randompath)
            except Exception:
                continue
            send_simple_message(
                SML_CONNECTION_TEST_COMMAND,
                body={"file": randompath},
                exchange=remote.exchange
            )
            successful += 1
        self.message_user(
            request,
            f"Managed to send {successful} out of {total} test commands; "
            "check their results in the Messages view."
        )

    def create_bucket(self, request, queryset):
        total = queryset.count()
        success = 0
        for remote in queryset.all():
            success += 1 if remote.create_bucket() else 0
        self.message_user(request, f"{success} out of {total} remotes were given a bucket")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("__str__", "created_at")
    date_hierarchy = "created_at"


admin.site.register(EventTraceRequest, VersionAdmin)


@admin.register(DataDumpRequest)
class DataDumpRequestAdmin(VersionAdmin):
    list_display = ("__str__", "target", "profile", "state", "created_at")


@admin.register(VersionHash)
class VersionHashAdmin(VersionAdmin):
    list_display = ("remote_str_namespace", "created_at",
                    "manifest_versions", "is_update_version")
    readonly_fields = ("remote", "created_at",
                       "manifest_versions", "hashes_set", "is_valid_set")
    date_hierarchy = "created_at"

    def set_to_html(self, _set_h):
        t_1 = """<ul>
                {0}
                </ul>"""
        t_2_f = """<li>{0}: <img src="/api/static/admin/img/icon-no.svg" alt="False"></li>"""
        t_2_t = """<li>{0}: <img src="/api/static/admin/img/icon-yes.svg" alt="True"></li>"""
        t_2_none = """<li>{0}: Doesn't exist or is empy</li>"""

        l_1 = []

        for i in _set_h:
            if i[1]:
                l_1.append(t_2_t.format(i[0]))
            elif i[1] is None:
                l_1.append(t_2_none.format(i[0]))
            else:
                l_1.append(t_2_f.format(i[0]))

        ret = t_1.format("".join(l_1))

        return ret

    def is_update_version(self, obj):
        return mark_safe(self.set_to_html(obj.is_valid_set))
