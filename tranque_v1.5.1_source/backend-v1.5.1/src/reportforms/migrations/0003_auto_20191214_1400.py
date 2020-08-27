import math

import django.core.validators
from django.db import migrations, models


def calculate_trimester_from_start_date(apps, schema_editor):
    ReportFormInstance = apps.get_model("reportforms", "ReportFormInstance")
    for form_instance in ReportFormInstance.objects.all():
        form_instance.year = form_instance.start_date.year
        form_instance.trimester = math.ceil(form_instance.start_date.month / 3)
        form_instance.save()


class Migration(migrations.Migration):
    dependencies = [
        ('reportforms', '0002_load_data_from_old_tables'),
    ]

    operations = [
        migrations.AddField(
            model_name='reportforminstance',
            name='trimester',
            field=models.PositiveSmallIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1),
                                                                          django.core.validators.MaxValueValidator(4)]),
        ),
        migrations.AddField(
            model_name='reportforminstance',
            name='year',
            field=models.PositiveSmallIntegerField(default=2019),
        ),
        migrations.RunPython(calculate_trimester_from_start_date, migrations.RunPython.noop),
    ]
