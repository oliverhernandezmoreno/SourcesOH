# Generated by Django 2.1 on 2019-05-28 15:09

import base.fields
import django.contrib.gis.db.models.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('targets', '0022_auto_20190424_2126'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReferencePoint',
            fields=[
                ('id', models.CharField(default=base.fields.generate_id, editable=False, max_length=22, primary_key=True, serialize=False)),
                ('name', models.CharField(blank=True, max_length=510, null=True)),
                ('canonical_name', models.SlugField(max_length=510)),
                ('coords', base.fields.ValidatedJSONField(schema={'additionalProperties': False, 'properties': {'srid': {'type': 'number'}, 'x': {'type': 'number'}, 'y': {'type': 'number'}}, 'required': ['x', 'y'], 'type': 'object'})),
                ('geometry', django.contrib.gis.db.models.fields.PointField(editable=False, srid=4326)),
            ],
            options={
                'ordering': ['target', 'canonical_name'],
            },
        ),
        migrations.AlterField(
            model_name='datasource',
            name='geometry',
            field=django.contrib.gis.db.models.fields.PointField(blank=True, editable=False, null=True, srid=4326),
        ),
        migrations.AlterField(
            model_name='target',
            name='geometry',
            field=django.contrib.gis.db.models.fields.PointField(blank=True, editable=False, null=True, srid=4326),
        ),
        migrations.AlterField(
            model_name='zone',
            name='geometry',
            field=django.contrib.gis.db.models.fields.PointField(editable=False, srid=4326),
        ),
        migrations.AddField(
            model_name='referencepoint',
            name='target',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reference_points', to='targets.Target'),
        ),
        migrations.AlterUniqueTogether(
            name='referencepoint',
            unique_together={('canonical_name', 'target')},
        ),
    ]
