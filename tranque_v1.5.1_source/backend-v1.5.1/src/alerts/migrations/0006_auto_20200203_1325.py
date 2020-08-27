# Generated by Django 2.2.10 on 2020-02-03 13:25

import base.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('alerts', '0005_ticket_groups'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userintent',
            name='content',
            field=base.fields.ValidatedJSONField(default=dict, schema={'properties': {'document': {'oneOf': [{'type': 'string'}, {'type': 'null'}]}, 'state': {'type': 'string'}}, 'required': ['state'], 'type': 'object'}),
        ),
    ]
