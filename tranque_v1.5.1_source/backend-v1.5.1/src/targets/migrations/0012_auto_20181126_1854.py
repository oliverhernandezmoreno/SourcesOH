# Generated by Django 2.1 on 2018-11-26 18:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('targets', '0011_auto_20181120_2158'),
    ]

    operations = [
        migrations.AlterField(
            model_name='timeseries',
            name='canonical_name',
            field=models.CharField(max_length=510, unique=True),
        ),
    ]
