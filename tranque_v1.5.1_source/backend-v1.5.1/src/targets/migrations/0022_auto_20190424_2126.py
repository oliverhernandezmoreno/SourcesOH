# Generated by Django 2.1 on 2019-04-24 21:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('targets', '0021_timeseries_template_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='datasource',
            name='documents',
        ),
        migrations.RemoveField(
            model_name='target',
            name='documents',
        ),
    ]
