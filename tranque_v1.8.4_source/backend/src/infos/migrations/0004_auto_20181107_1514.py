# Generated by Django 2.1 on 2018-11-07 15:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('infos', '0003_auto_20181107_1513'),
    ]

    operations = [
        migrations.AlterField(
            model_name='info',
            name='id',
            field=models.IntegerField(primary_key=True, serialize=False),
        ),
    ]