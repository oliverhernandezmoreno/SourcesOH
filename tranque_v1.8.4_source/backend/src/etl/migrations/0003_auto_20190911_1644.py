# Generated by Django 2.1 on 2019-09-11 16:44

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('etl', '0002_auto_20190903_2059'),
    ]

    operations = [
        migrations.AddField(
            model_name='etlcleanedvalue',
            name='meta',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=dict, null=True),
        ),
        migrations.AddField(
            model_name='etlconformedvalue',
            name='meta',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=dict, null=True),
        ),
    ]