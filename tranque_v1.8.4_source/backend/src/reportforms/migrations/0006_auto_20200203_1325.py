# Generated by Django 2.2.10 on 2020-02-03 13:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reportforms', '0005_forminstancerequest'),
    ]

    operations = [
        migrations.AlterField(
            model_name='forminstancerequest',
            name='state',
            field=models.CharField(choices=[('created', 'Request created'), ('accepted', 'Request accepted'), ('rejected', 'Request rejected')], default='created', max_length=200),
        ),
    ]
