# Generated by Django 2.2.11 on 2020-04-06 21:42

import base.fields
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion
import functools
import remotes.models


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0004_auto_20200210_1929'),
        ('targets', '0033_auto_20200210_1929'),
        ('alerts', '0006_auto_20200203_1325'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='contributingdocument',
            options={'ordering': ['-id']},
        ),
        migrations.AddField(
            model_name='ticket',
            name='archive_conditions',
            field=base.fields.ValidatedJSONField(default=list, schema={'items': {'properties': {'complete': {'type': 'boolean'}, 'description': {'type': 'string'}}, 'required': ['description', 'complete'], 'type': 'object'}, 'type': 'array'}),
        ),
        migrations.AddField(
            model_name='ticket',
            name='escalate_conditions',
            field=base.fields.ValidatedJSONField(default=dict, schema={'additionalProperties': {'items': {'properties': {'complete': {'type': 'boolean'}, 'description': {'type': 'string'}}, 'required': ['description', 'complete'], 'type': 'object'}, 'type': 'array'}, 'type': 'object'}),
        ),
        migrations.AddField(
            model_name='ticket',
            name='origin',
            field=models.CharField(default=remotes.models.current_namespace, editable=False, max_length=255),
        ),
        migrations.AddField(
            model_name='ticket',
            name='propagated',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='ticket',
            name='public_alert_abstract',
            field=models.CharField(default='', max_length=510),
        ),
        migrations.AddField(
            model_name='ticketlog',
            name='origin',
            field=models.CharField(default=remotes.models.current_namespace, editable=False, max_length=255),
        ),
        migrations.AlterField(
            model_name='contributingdocument',
            name='target',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='contributing_documents', to='targets.Target'),
        ),
        migrations.AlterField(
            model_name='ticket',
            name='close_conditions',
            field=base.fields.ValidatedJSONField(default=list, schema={'items': {'properties': {'complete': {'type': 'boolean'}, 'description': {'type': 'string'}}, 'required': ['description', 'complete'], 'type': 'object'}, 'type': 'array'}),
        ),
        migrations.AlterField(
            model_name='ticket',
            name='result_state',
            field=base.fields.ValidatedJSONField(default=functools.partial(dict, *(), **{'level': -1, 'short_message': 'no message'}), schema={'properties': {'level': {'minimum': -1, 'type': 'number'}, 'message': {'type': 'string'}, 'short_message': {'type': 'string'}}, 'required': ['level', 'short_message'], 'type': 'object'}),
        ),
        migrations.AlterField(
            model_name='ticketlog',
            name='meta',
            field=base.fields.ValidatedJSONField(default=dict, schema={'properties': {'description': {'type': 'string'}, 'next_archived': {'type': 'boolean'}, 'next_evaluable': {'type': 'boolean'}, 'next_state': {'type': 'string'}, 'previous_archived': {'type': 'boolean'}, 'previous_evaluable': {'type': 'boolean'}, 'previous_state': {'oneOf': [{'type': 'string'}, {'type': 'null'}]}}, 'type': 'object'}),
        ),
        migrations.AlterField(
            model_name='ticketlog',
            name='timeseries',
            field=base.fields.ValidatedJSONField(default=list, schema={'items': {'properties': {'canonical_name': {'type': 'string'}, 'events': {'items': {'type': 'string'}, 'type': 'array'}}, 'required': ['canonical_name', 'events'], 'type': 'object'}, 'type': 'array'}),
        ),
        migrations.AlterField(
            model_name='userintent',
            name='content',
            field=base.fields.ValidatedJSONField(default=dict, schema={'properties': {'archived': {'type': 'boolean'}, 'document': {'oneOf': [{'type': 'string'}, {'type': 'null'}]}, 'state': {'type': 'string'}}, 'required': [], 'type': 'object'}),
        ),
        migrations.CreateModel(
            name='TicketComment',
            fields=[
                ('id', models.CharField(default=base.fields.generate_id, editable=False, max_length=22, primary_key=True, serialize=False)),
                ('comment_type', models.CharField(choices=[('event_management', 'Ticket management report'), ('alert_complementary', 'Complementary information to enrich alert message in public site'), ('alert_management', 'Alert management report'), ('close_report', 'Close report')], max_length=25)),
                ('content', models.TextField(blank=True)),
                ('created_by', django.contrib.postgres.fields.jsonb.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('origin', models.CharField(default=remotes.models.current_namespace, editable=False, max_length=255)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('documents', models.ManyToManyField(blank=True, related_name='_ticketcomment_documents_+', to='documents.Document')),
                ('ticket', models.ForeignKey(editable=False, on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='alerts.Ticket')),
            ],
            options={
                'ordering': ['updated_at'],
            },
        ),
        migrations.CreateModel(
            name='PublicAlertMessage',
            fields=[
                ('id', models.CharField(default=base.fields.generate_id, editable=False, max_length=22, primary_key=True, serialize=False)),
                ('alert_type', models.CharField(choices=[('YELLOW', 'Public yellow alert message'), ('RED', 'Public red alert message')], max_length=25)),
                ('content', models.TextField(blank=True)),
                ('created_by', django.contrib.postgres.fields.jsonb.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('target', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alert_messages', to='targets.Target')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='AuthorizationRequest',
            fields=[
                ('id', models.CharField(default=base.fields.generate_id, editable=False, max_length=22, primary_key=True, serialize=False)),
                ('action', models.CharField(max_length=512)),
                ('created_by', django.contrib.postgres.fields.jsonb.JSONField()),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('origin', models.CharField(default=remotes.models.current_namespace, editable=False, max_length=255)),
                ('resolved_by', django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True)),
                ('resolved_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('comment', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('waiting', 'en espera'), ('approved', 'aprobada'), ('denied', 'denegada')], default='waiting', max_length=10)),
                ('documents', models.ManyToManyField(blank=True, related_name='_authorizationrequest_documents_+', to='documents.Document')),
                ('ticket', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='authorizations', to='alerts.Ticket')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
