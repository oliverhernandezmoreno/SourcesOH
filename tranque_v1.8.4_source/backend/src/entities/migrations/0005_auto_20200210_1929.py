# Generated by Django 2.2.9 on 2020-02-10 19:29

import base.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('entities', '0004_auto_20190702_2200'),
    ]

    operations = [
        migrations.AlterField(
            model_name='entity',
            name='meta',
            field=base.fields.ValidatedJSONField(schema={'patternProperties': {'^.*$': {'additionalProperties': False, 'properties': {'name': {'type': 'string'}, 'order': {'type': 'number'}, 'value': {'type': ['number', 'string', 'boolean', 'null']}}, 'required': ['value'], 'type': 'object'}}, 'type': 'object'}),
        ),
    ]