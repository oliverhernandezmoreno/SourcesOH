# Generated by Django 2.1 on 2018-10-26 18:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('targets', '0002_auto_20181025_1258'),
    ]

    operations = [
        migrations.AlterField(
            model_name='target',
            name='documents',
            field=models.ManyToManyField(blank=True, related_name='targets', to='documents.Document'),
        ),
        migrations.AlterField(
            model_name='targetsection',
            name='documents',
            field=models.ManyToManyField(blank=True, related_name='sections', to='documents.Document'),
        ),
    ]
