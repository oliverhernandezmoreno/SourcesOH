# Generated by Django 2.1 on 2018-11-01 23:25

import base.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('targets', '0005_acquiredprotocol_meta'),
    ]

    operations = [
        migrations.AddField(
            model_name='timeseries',
            name='choices',
            field=base.fields.ValidatedJSONField(blank=True, default=list, null=True, schema={'items': {'additionalProperties': False, 'properties': {'choice': {'type': 'string'}, 'value': {'additionalProperties': False, 'properties': {'choiceValue': {'type': 'number'}, 'gt': {'type': 'number'}, 'gte': {'type': 'number'}, 'lt': {'type': 'number'}, 'lte': {'type': 'number'}}, 'required': ['choiceValue'], 'type': 'object'}}, 'required': ['value', 'choice'], 'type': 'object'}, 'type': 'array'}),
        ),
    ]
