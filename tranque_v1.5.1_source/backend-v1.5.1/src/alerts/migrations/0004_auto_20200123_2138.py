# Generated by Django 2.1 on 2020-01-23 21:38

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('alerts', '0003_auto_20200122_1924'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ticketlog',
            name='author',
        ),
        migrations.AddField(
            model_name='ticketlog',
            name='author_obj',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True),
        ),
        migrations.RenameField(
            model_name='ticketlog',
            old_name='author_obj',
            new_name='author',
        ),
    ]
