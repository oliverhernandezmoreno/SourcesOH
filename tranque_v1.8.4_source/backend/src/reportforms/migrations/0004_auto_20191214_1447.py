# Generated by Django 2.1 on 2019-12-14 14:47

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reportforms', '0003_auto_20191214_1400'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='reportforminstance',
            name='end_date',
        ),
        migrations.RemoveField(
            model_name='reportforminstance',
            name='start_date',
        ),
        migrations.AlterField(
            model_name='reportforminstance',
            name='trimester',
            field=models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(4)]),
        ),
        migrations.AlterField(
            model_name='reportforminstance',
            name='year',
            field=models.PositiveSmallIntegerField(),
        ),
    ]
