import json
from pathlib import Path

from django.core.exceptions import ValidationError

from api.tests.base import BaseTestCase
from reportforms.models import ReportForm, ReportFormVersion, ReportFormInstance


class TestCreateReportFormCommand(BaseTestCase):

    with open(Path(__file__).parent / "test-schema.json") as f:
        test_schema = json.load(f)

    def test_schema_is_immutable_after_instances_exist(self):
        form = ReportForm.objects.create(
            codename="asdf",
            name="Asdf",
            description="Asdf asdf",
        )
        version = ReportFormVersion.objects.create(
            code=1,
            title="Asdf v1",
            form=form,
            form_schema=self.test_schema,
        )
        # attempt to modify the schema before any instances exist
        version.form_schema = {
            **version.form_schema,
            "something": "predictable",
        }
        version.save()
        # attempt to modify the schema after an instance exists
        ReportFormInstance.objects.create(
            version=version,
            trimester=4,
            year=2021,
            target=self.target_object,
        )
        try:
            version.form_schema = {
                **version.form_schema,
                "something": "unexpected",
            }
            version.save()
            assert False, "version schema isn't immutable"
        except ValidationError:
            pass
