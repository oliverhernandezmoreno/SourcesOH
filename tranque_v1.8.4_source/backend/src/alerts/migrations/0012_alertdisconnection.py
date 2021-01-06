# Generated by Django 2.2.12 on 2020-05-29 23:59

import base.fields
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('targets', '0036_auto_20200529_1338'),
        ('documents', '0004_auto_20200210_1929'),
        ('alerts', '0011_auto_20200518_2144'),
    ]

    operations = [
        migrations.CreateModel(
            name='AlertDisconnection',
            fields=[
                ('id', models.CharField(default=base.fields.generate_id, editable=False, max_length=22, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('created_by', django.contrib.postgres.fields.jsonb.JSONField(default=dict)),
                ('scope', models.CharField(choices=[('emac', 'emac'), ('ef', 'ef')], default='ef', max_length=5)),
                ('closed', models.BooleanField(default=False)),
                ('closed_at', models.DateTimeField(blank=True, null=True)),
                ('comment', models.TextField(blank=True, null=True)),
                ('documents', models.ManyToManyField(blank=True, related_name='_alertdisconnection_documents_+', to='documents.Document')),
                ('target', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alert_disconnections', to='targets.Target')),
            ],
            options={
                'ordering': ['created_at'],
            },
        ),
    ]