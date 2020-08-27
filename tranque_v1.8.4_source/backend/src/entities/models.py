import reversion
from django.conf import settings
from django.contrib.gis.db import models
from django.db.models.signals import post_save

from base.fields import AutoUUIDField
from base.fields import MetaJSONField


@reversion.register()
class EntityType(models.Model):
    id = models.SlugField(max_length=255, primary_key=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.id

    class Meta:
        ordering = ["id"]


@reversion.register()
class Entity(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    type = models.ForeignKey(
        EntityType,
        on_delete=models.PROTECT,
        related_name="+",
    )
    name = models.CharField(max_length=255)
    meta = MetaJSONField()

    def __str__(self):
        return self.id

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "entities"


@reversion.register()
class WorkSite(models.Model):
    id = AutoUUIDField()
    entity = models.ForeignKey(
        Entity,
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=510)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["entity", "id"]
        unique_together = [
            ("entity", "name"),
        ]


@reversion.register()
class UserProfile(models.Model):
    id = AutoUUIDField()
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    targets = models.ManyToManyField('targets.Target', related_name='+', blank=True)

    def __str__(self):
        return f'{str(self.user)}'


def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


post_save.connect(create_user_profile, sender=settings.AUTH_USER_MODEL)
