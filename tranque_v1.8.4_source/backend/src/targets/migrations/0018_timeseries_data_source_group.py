# Generated by Django 2.1 on 2019-03-19 15:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('targets', '0017_auto_20190319_1408'),
    ]

    operations = [
        migrations.AddField(
            model_name='timeseries',
            name='data_source_group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='timeseries', to='targets.DataSourceGroup'),
        ),
    ]