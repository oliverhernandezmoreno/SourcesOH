# Generated by Django 2.1 on 2019-07-04 20:14

from django.db import migrations, models


def set_default_remote(apps, schema_editor):
    # We get the model from the versioned app registry
    # if we directly import it, it'll be the wrong version
    Remote = apps.get_model('remotes', 'Remote')
    db_alias = schema_editor.connection.alias
    for r in Remote.objects.using(db_alias).all():
        r.bucket = r.namespace
        r.save()


class Migration(migrations.Migration):
    dependencies = [
        ('remotes', '0003_auto_20190523_1618'),
    ]

    operations = [
        migrations.AddField(
            model_name='remote',
            name='bucket',
            field=models.CharField(max_length=255, null=True, unique=True),
        ),
        migrations.RunPython(set_default_remote, migrations.RunPython.noop),
    ]
