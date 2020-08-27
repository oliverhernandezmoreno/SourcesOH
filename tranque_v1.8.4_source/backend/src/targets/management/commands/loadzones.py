from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
import json
from pathlib import Path
import pyproj

from targets.models import Zone
from targets.models import ZoneType


class Command(BaseCommand):
    help = "Loads zone data from official sources"

    SOURCES = (
        Path(__file__).parent / "data" / "regiones.json",
        Path(__file__).parent / "data" / "provincias.json",
        Path(__file__).parent / "data" / "comunas.json",
    )

    def load_source(self, source):
        with open(source) as f:
            return json.load(f)

    def convert_coords(self, coords):
        x, y = pyproj.Proj(init=settings.PROJECTION)(coords.get("lng"), coords.get("lat"))
        return {
            "srid": settings.PROJECTION_SRID,
            "x": x,
            "y": y,
        }

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            dest="force",
            help="Forces the mass load of zones, instead of bailing if at least one zone exists",
        )

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        force = kwargs.get("force", False)
        exists = Zone.objects.exists()
        if not force and exists:
            if verbosity > 0:
                self.stdout.write("Zones won't be loaded (some exist). Use --force to force re-creation")
            return

        data = [
            zone
            for zone_set in (
                self.load_source(source)
                for source in self.SOURCES
            )
            for zone in zone_set
        ]
        with transaction.atomic():
            ZoneType.objects.update_or_create(id="pais", defaults={"description": "País"})
            ZoneType.objects.update_or_create(id="region", defaults={"description": "Región"})
            ZoneType.objects.update_or_create(id="provincia", defaults={"description": "Provincia"})
            ZoneType.objects.update_or_create(id="comuna", defaults={"description": "Comuna"})
            Zone.objects.update_or_create(
                id="00",
                defaults=dict(
                    natural_name="cl",
                    parent_id=None,
                    name="Chile",
                    canonical_name="cl",
                    type_id="pais",
                    coords=self.convert_coords({
                        "lat": -33.4417,
                        "lng": -70.6541,
                    }),
                ),
            )
            for zone_data in data:
                Zone.objects.update_or_create(
                    id=zone_data.get("codigo"),
                    defaults=dict(
                        parent_id=zone_data.get("codigo_padre"),
                        name=zone_data.get("nombre"),
                        type_id=zone_data.get("tipo"),
                        coords=self.convert_coords({
                            "lat": zone_data.get("lat"),
                            "lng": zone_data.get("lng"),
                        }),
                    ),
                )
        if verbosity > 0:
            self.stdout.write(self.style.SUCCESS(f"Loaded {len(data) + 1} zones"))
