# Generated by Django 2.2.11 on 2020-05-20 22:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('entities', '0007_auto_20200422_1703'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userrole',
            name='actions',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='actions',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='approval_level',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='roles',
        ),
        migrations.DeleteModel(
            name='UserAction',
        ),
        migrations.DeleteModel(
            name='UserRole',
        ),
    ]