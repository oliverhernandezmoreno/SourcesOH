# Generated by Django 2.1 on 2019-06-05 16:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0002_auto_20190425_1841'),
    ]

    operations = [
        migrations.RenameField(
            model_name='document',
            old_name='directory',
            new_name='folder',
        ),
    ]
