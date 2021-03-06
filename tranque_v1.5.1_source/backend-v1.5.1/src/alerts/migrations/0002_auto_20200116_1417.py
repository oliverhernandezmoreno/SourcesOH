# Generated by Django 2.1 on 2020-01-16 14:17

import base.fields
from django.conf import settings
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion
import functools


class Migration(migrations.Migration):

    dependencies = [
        ('targets', '0031_auto_20200116_1417'),
        ('documents', '0003_auto_20190605_1626'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('alerts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AttendedEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('module', models.CharField(db_index=True, max_length=510)),
                ('event_id', models.CharField(max_length=510)),
                ('event_version', models.IntegerField()),
                ('target', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='+', to='targets.Target')),
            ],
        ),
        migrations.CreateModel(
            name='Broadcast',
            fields=[
                ('id', models.CharField(default=base.fields.generate_id, editable=False, max_length=22, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('broadcasted_at', models.DateTimeField(db_index=True, editable=False, null=True)),
                ('handlers', base.fields.ValidatedJSONField(default=list, schema={'items': {'properties': {'name': {'type': 'string'}}, 'type': 'object'}, 'type': 'array'})),
                ('author', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ContributingDocument',
            fields=[
                ('id', models.CharField(default=base.fields.generate_id, editable=False, max_length=22, primary_key=True, serialize=False)),
                ('module', models.CharField(db_index=True, max_length=510)),
                ('document', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='contributions', to='documents.Document')),
                ('target', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='+', to='targets.Target')),
            ],
        ),
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.CharField(default=base.fields.generate_id, editable=False, max_length=22, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True, db_index=True)),
                ('module', models.CharField(db_index=True, max_length=510)),
                ('state', models.CharField(db_index=True, max_length=510)),
                ('result_state', base.fields.ValidatedJSONField(default=functools.partial(dict, *(), **{'level': 0}), schema={'properties': {'level': {'minimum': 0, 'type': 'number'}, 'message': {'type': 'string'}, 'short_message': {'type': 'string'}}, 'required': ['level'], 'type': 'object'})),
                ('spread_object', django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True)),
                ('target', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tickets', to='targets.Target')),
            ],
            options={
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='TicketLog',
            fields=[
                ('id', models.CharField(default=base.fields.generate_id, editable=False, max_length=22, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('highlight', models.BooleanField(db_index=True, default=False)),
                ('timeseries', django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True)),
                ('meta', base.fields.ValidatedJSONField(default=dict, schema={'properties': {'description': {'type': 'string'}, 'events': {'items': {'type': 'object'}, 'type': 'array'}}, 'type': 'object'})),
                ('author', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('documents', models.ManyToManyField(blank=True, related_name='_ticketlog_documents_+', to='documents.Document')),
                ('ticket', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='logs', to='alerts.Ticket')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='UserIntent',
            fields=[
                ('id', models.CharField(default=base.fields.generate_id, editable=False, max_length=22, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('module', models.CharField(db_index=True, max_length=510)),
                ('content', base.fields.ValidatedJSONField(default=dict, schema={'properties': {'document': {'type': 'string'}, 'state': {'type': 'string'}}, 'required': ['state'], 'type': 'object'})),
                ('attended_at', models.DateTimeField(db_index=True, null=True)),
                ('issue', models.CharField(blank=True, choices=[('', 'no hay problemas'), ('insufficient-permissions', 'el usuario no tiene permisos suficientes'), ('insufficient-information', 'faltan antecedentes'), ('blocked-by-rules', 'bloqueado por reglas del sistema')], default='', max_length=255)),
                ('target', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_intents', to='targets.Target')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.RemoveField(
            model_name='action',
            name='alert',
        ),
        migrations.RemoveField(
            model_name='action',
            name='type',
        ),
        migrations.DeleteModel(
            name='ActionType',
        ),
        migrations.RemoveField(
            model_name='alert',
            name='timeseries',
        ),
        migrations.RemoveField(
            model_name='alert',
            name='type',
        ),
        migrations.RemoveField(
            model_name='alertescalationpolicy',
            name='timeseries',
        ),
        migrations.DeleteModel(
            name='AlertType',
        ),
        migrations.DeleteModel(
            name='Action',
        ),
        migrations.DeleteModel(
            name='Alert',
        ),
        migrations.DeleteModel(
            name='AlertEscalationPolicy',
        ),
        migrations.AddField(
            model_name='broadcast',
            name='ticket',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='broadcasts', to='alerts.Ticket'),
        ),
    ]
