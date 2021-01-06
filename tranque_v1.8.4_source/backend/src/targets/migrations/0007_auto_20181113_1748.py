# Generated by Django 2.1 on 2018-11-13 17:48

import base.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('targets', '0006_timeseries_choices'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='targetsection',
            name='documents',
        ),
        migrations.RemoveField(
            model_name='targetsection',
            name='parent',
        ),
        migrations.RemoveField(
            model_name='targetsection',
            name='target',
        ),
        migrations.RemoveField(
            model_name='targetsection',
            name='type',
        ),
        migrations.DeleteModel(
            name='TargetSectionType',
        ),
        migrations.AlterModelOptions(
            name='datasourcegroup',
            options={'ordering': ['target', 'canonical_name']},
        ),
        migrations.RemoveField(
            model_name='measurementunit',
            name='si_conversion',
        ),
        migrations.RemoveField(
            model_name='timeseries',
            name='section',
        ),
        migrations.AddField(
            model_name='datasource',
            name='groups',
            field=models.ManyToManyField(blank=True, related_name='data_sources', to='targets.DataSourceGroup'),
        ),
        migrations.AddField(
            model_name='datasourcegroup',
            name='canonical_name',
            field=models.SlugField(default='', editable=False, max_length=510),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='datasourcegroup',
            name='meta',
            field=base.fields.ValidatedJSONField(blank=True, null=True, schema={'additionalProperties': False, 'patternProperties': {'^.*$': {'additionalProperties': False, 'properties': {'name': {'type': 'string'}, 'order': {'type': 'number'}, 'value': {'type': ['number', 'string', 'boolean', 'null']}}, 'required': ['value'], 'type': 'object'}}, 'type': 'object'}),
        ),
        migrations.AddField(
            model_name='measurementunit',
            name='si_conversion_scale',
            field=models.DecimalField(blank=True, decimal_places=8, max_digits=16, null=True),
        ),
        migrations.AddField(
            model_name='measurementunit',
            name='si_conversion_shift',
            field=models.DecimalField(blank=True, decimal_places=8, max_digits=16, null=True),
        ),
        migrations.RemoveField(
            model_name='datasource',
            name='group',
        ),
        migrations.RemoveField(
            model_name='datasource',
            name='section',
        ),
        migrations.RemoveField(
            model_name='datasource',
            name='type',
        ),
        migrations.AlterUniqueTogether(
            name='datasource',
            unique_together={('target', 'hardware_id')},
        ),
        migrations.AlterUniqueTogether(
            name='datasourcegroup',
            unique_together={('target', 'canonical_name')},
        ),
        migrations.DeleteModel(
            name='DataSourceType',
        ),
        migrations.DeleteModel(
            name='TargetSection',
        ),
    ]