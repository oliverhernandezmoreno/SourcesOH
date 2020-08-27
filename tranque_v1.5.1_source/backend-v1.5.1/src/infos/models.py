import reversion
from django.db import models


class Info(models.Model):
    id = models.IntegerField(primary_key=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    image_url = models.CharField(max_length=255, blank=True, null=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return str(self.id) + "- " + self.title

    class Meta:
        ordering = ["id"]


@reversion.register()
class SiteParameter(models.Model):
    name = models.CharField(max_length=510, null=False, blank=False, primary_key=True)
    value = models.TextField(blank=True, default='')
