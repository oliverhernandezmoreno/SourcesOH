# Generated by Django 2.1 on 2019-09-04 20:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('targets', '0027_datasource_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='timeseries',
            name='active',
            field=models.BooleanField(default=True),
        ),
    ]