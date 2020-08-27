import json
from pathlib import Path

from django.core import management

from api.tests.base import BaseTestCase
from reportforms.models import ReportForm, ReportFormVersion


class TestCreateReportFormCommand(BaseTestCase):

    schema = str(Path(__file__).parent / "test-schema.json")

    with open(schema) as f:
        schema_data = json.load(f)

    def test_defaults_when_nothing_exists(self):
        management.call_command("createreportform", "foo-codename", self.schema)
        form = ReportForm.objects.get(codename="foo-codename")
        version = ReportFormVersion.objects.get(form__codename="foo-codename")
        self.assertEquals(form.name, "foo-codename")
        self.assertEquals(form.description, "")
        self.assertEquals(version.code, 1)
        self.assertEquals(version.title, "v1")
        self.assertEquals(version.form_schema, self.schema_data)

    def test_defaults_when_something_exists(self):
        management.call_command("createreportform", "foo-codename", self.schema)
        management.call_command("createreportform", "bar-codename", self.schema)
        management.call_command("createreportform", "foo-codename", self.schema)
        form = ReportForm.objects.get(codename="foo-codename")
        version = (
            ReportFormVersion.objects
            .filter(form__codename="foo-codename")
            .order_by("-code")
            .first()
        )
        self.assertEquals(form.name, "foo-codename")
        self.assertEquals(form.description, "")
        self.assertEquals(version.code, 2)
        self.assertEquals(version.title, "v2")
        self.assertEquals(version.form_schema, self.schema_data)
        other_version = ReportFormVersion.objects.get(form__codename="bar-codename")
        self.assertEquals(other_version.code, 1)
        self.assertEquals(other_version.title, "v1")
        self.assertEquals(other_version.form_schema, self.schema_data)

    def test_command_options(self):
        management.call_command("createreportform", "foo-codename", self.schema)
        management.call_command(
            "createreportform",
            "foo-codename",
            self.schema,
            name="different-than-foo",
            description="Not blank",
            version_code=1,
            version_title="v1-super-duper",
        )
        form = ReportForm.objects.get(codename="foo-codename")
        version = ReportFormVersion.objects.get(form__codename="foo-codename")
        self.assertEquals(form.name, "different-than-foo")
        self.assertEquals(form.description, "Not blank")
        self.assertEquals(version.code, 1)
        self.assertEquals(version.title, "v1-super-duper")
        self.assertEquals(version.form_schema, self.schema_data)
