# Generated by Django 2.1 on 2018-11-15 19:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('targets', '0008_auto_20181113_2051'),
    ]

    operations = [
        migrations.AddField(
            model_name='timeseries',
            name='script',
            field=models.TextField(blank=True),
        ),
    ]