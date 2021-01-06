# Generated by Django 2.2.13 on 2020-06-13 00:39

import base.fields
from django.db import migrations, models
import django.db.models.deletion
import targets.models


class Migration(migrations.Migration):

    dependencies = [
        ('targets', '0039_auto_20200612_2137'),
    ]

    operations = [
        migrations.CreateModel(
            name='Camera',
            fields=[
                ('id', models.CharField(default=base.fields.generate_id, editable=False, max_length=22, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('name', models.CharField(max_length=255)),
                ('label', models.CharField(max_length=255)),
                ('target', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='cameras', to='targets.Target')),
            ],
            options={
                'unique_together': {('target', 'name')},
            },
        ),
        migrations.CreateModel(
            name='VideoFrame',
            fields=[
                ('id', models.CharField(default=base.fields.generate_id, editable=False, max_length=22, primary_key=True, serialize=False)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('image', models.ImageField(upload_to=targets.models.video_frame_upload_to)),
                ('timestamp', models.DateTimeField(db_index=True)),
                ('camera', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='video_frames', to='targets.Camera')),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
    ]