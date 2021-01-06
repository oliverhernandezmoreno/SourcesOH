# Generated by Django 2.1 on 2020-01-14 14:29

import base.fields
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('targets', '0030_auto_20191120_1754'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('remotes', '0007_eventtracerequest'),
    ]

    operations = [
        migrations.CreateModel(
            name='DataDumpRequest',
            fields=[
                ('id', models.CharField(default=base.fields.generate_id, editable=False, max_length=22, primary_key=True, serialize=False)),
                ('profile', models.CharField(max_length=20)),
                ('date_from', models.DateTimeField()),
                ('date_to', models.DateTimeField()),
                ('state', models.CharField(choices=[('waiting_response', 'Waiting Response'), ('received', 'Received')], default='waiting_response', max_length=20)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('received_at', models.DateTimeField(blank=True, null=True)),
                ('events_file', models.FileField(blank=True, max_length=1020, null=True, upload_to='dumps/')),
                ('timeseries_file', models.FileField(blank=True, max_length=1020, null=True, upload_to='dumps/')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('target', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='+', to='targets.Target')),
            ],
        ),
    ]