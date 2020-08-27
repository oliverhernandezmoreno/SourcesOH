from itertools import islice
from pathlib import Path

import xlrd
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from entities.models import Entity
from entities.models import EntityType
from entities.models import WorkSite
from targets.models import Target
from targets.models import TargetState
from targets.models import TargetType
from targets.models import Zone


class Command(BaseCommand):
    help = "Loads targets from an official source"

    DEFAULT_SOURCE = Path(__file__).parent / "data" / "depositos.xls"
    DEFAULT_OFFSET = 9

    PROVINCE_HEADER = "PROVINCIA"
    COMMUNE_HEADER = "COMUNA"

    ZONE_MAPPINGS = {
        ("SAN FELIPE", None): ("SAN FELIPE DE ACONCAGUA", None),
        ("EL TAMARUGAL", None): ("TAMARUGAL", None),
        (None, "OLMUE"): ("MARGA MARGA", "OLMUE"),
        ("COYHAIQUE", "RIO IBAÑEZ"): ("GENERAL CARRERA", "RIO IBANEZ"),
        ("ELQUI", "COMBARBALA"): ("LIMARI", "COMBARBALA"),
        ("QUILLOTA", "LA CALERA"): ("QUILLOTA", "CALERA"),
        ("COYHAIQUE", "COYHAIQUE"): ("COIHAIQUE", "COIHAIQUE"),
        ("COYHAIQUE", None): ("COIHAIQUE", None),
        ("SAN FELIPE", "LLAYLLAY"): ("SAN FELIPE DE ACONCAGUA", "LLAILLAY"),
    }

    TARGET_NAME_HEADER = "INSTALACION"
    TARGET_TYPE_HEADER = "TIPO INSTALACION"
    TARGET_STATE_HEADER = "ESTADO INSTALACION"
    UTM_NORTH_HEADER = "UTM_NORTE"
    UTM_EAST_HEADER = "UTM_ESTE"
    META_HEADERS = (
        ("EMPRESA", "entity"),
        ("FAENA", "work"),
        ("RECURSO", "resource"),
        ("VOLUMEN APROBADO (m³)", "approved_volume"),
        ("VOLUMEN ACTUAL", "current_volume"),
        ("TONELAJE APROBADO (t)", "approved_tons"),
        ("TONELAJE ACTUAL (t)", "current_tons"),
    )

    OPEN_OPTIONS = {}

    def load_source(self, source, offset):
        sheet = xlrd.open_workbook(source, **self.OPEN_OPTIONS).sheet_by_index(0)
        rows = islice(sheet.get_rows(), offset, None)
        headers = [cell.value for cell in next(rows)]
        return (
            dict((k, v) for k, v in zip(headers, [cell.value for cell in row]) if k)
            for row in rows
        )

    def map_zone(self, province, commune):
        attempts = (
            (province, commune),
            (province, None),
            (None, commune),
            (None, None),
        )
        for attempt in attempts:
            mapped = self.ZONE_MAPPINGS.get(attempt)
            if mapped:
                return (mapped[0] or province, mapped[1] or commune)
        return province, commune

    def parse_zone(self, row):
        province, commune = self.map_zone(row[self.PROVINCE_HEADER], row[self.COMMUNE_HEADER])
        return Zone.objects.get(type="comuna", natural_name__endswith=f"{slugify(province)}.{slugify(commune)}")

    def canonical_name_attempt_catalog(self, full_vector):
        return (
            *(full_vector[:i] for i, _ in enumerate(full_vector, start=1)),
            (self.TARGET_NAME_HEADER, self.UTM_NORTH_HEADER, self.UTM_EAST_HEADER),
        )

    def build_canonical_name(self, row, rows):
        full_vector = (
            self.TARGET_NAME_HEADER,
            self.COMMUNE_HEADER,
            self.TARGET_TYPE_HEADER,
            self.META_HEADERS[1][0],
            self.META_HEADERS[0][0],
            self.META_HEADERS[2][0]
        )

        for attempt in self.canonical_name_attempt_catalog(full_vector):
            slug = slugify(" ".join(str(row[k]) for k in attempt))
            pool = [s for s in (slugify(" ".join(str(r[k]) for k in attempt)) for r in rows) if s == slug]
            if len(pool) == 1:
                return slug
        raise RuntimeError(f"no unique canonical name could be built for {row}")

    def add_arguments(self, parser):
        parser.add_argument("source", nargs="?", help="Source xls file")
        parser.add_argument("offset", nargs="?", type=int, help="The first row (the headers)")
        parser.add_argument(
            "--force",
            action="store_true",
            dest="force",
            help="Forces the mass load of targets, instead of bailing if at least one target exists",
        )

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        force = kwargs.get("force", False)
        exists = Target.objects.exists()
        if not force and exists:
            if verbosity > 0:
                self.stdout.write("Targets won't be loaded (some exist). Use --force to force re-creation")
            return

        source = kwargs["source"] or self.DEFAULT_SOURCE
        offset = kwargs["offset"] or self.DEFAULT_OFFSET
        with transaction.atomic():
            # target types
            TargetType.objects.update_or_create(
                id="embalse", defaults={"description": "Embalse"},
            )
            TargetType.objects.update_or_create(
                id="en-pasta",
                defaults={"description": "En pasta"},
            )
            TargetType.objects.update_or_create(
                id="espesado",
                defaults={"description": "Espesado"},
            )
            TargetType.objects.update_or_create(
                id="filtrado",
                defaults={"description": "Filtrado"},
            )
            TargetType.objects.update_or_create(
                id="piscinas-de-emergencia",
                defaults={"description": "Piscinas de emergencia"},
            )
            TargetType.objects.update_or_create(
                id="tranque-de-relave",
                defaults={"description": "Tranque de relave", "default": True},
            )

            # target states
            TargetState.objects.update_or_create(
                id="abandonado",
                defaults={"description": "Abandonado"},
            )
            TargetState.objects.update_or_create(
                id="activo",
                defaults={"description": "Activo", "default": True},
            )
            TargetState.objects.update_or_create(
                id="inactivo",
                defaults={"description": "Inactivo"},
            )
            TargetState.objects.update_or_create(
                id="irregular-no-operativo",
                defaults={"description": "Irregular no operativo"},
            )
            TargetState.objects.update_or_create(
                id="irregular-operativo",
                defaults={"description": "Irregular operativo"},
            )
            TargetState.objects.update_or_create(
                id="paralizado-sancion",
                defaults={"description": "Paralizado por sanción"},
            )

            # entity types
            empresa_type, _ = EntityType.objects.update_or_create(
                id="empresa",
                defaults={"description": "Empresa"},
            )

            # targets
            targets = 0
            rows = list(self.load_source(source, offset))
            for row in rows:
                zone = self.parse_zone(row)
                state, _ = TargetState.objects.update_or_create(
                    id=slugify(row[self.TARGET_STATE_HEADER]),
                    defaults={"description": row[self.TARGET_STATE_HEADER].capitalize()},
                )
                type, _ = TargetType.objects.update_or_create(
                    id=slugify(row[self.TARGET_TYPE_HEADER]),
                    defaults={"description": row[self.TARGET_TYPE_HEADER].capitalize()},
                )
                name = row[self.TARGET_NAME_HEADER].capitalize()
                coords = {
                    "srid": settings.PROJECTION_SRID,
                    "x": row[self.UTM_EAST_HEADER],
                    "y": row[self.UTM_NORTH_HEADER],
                }
                meta = {
                    k: {"value": row[ok], "name": ok.capitalize()}
                    for ok, k in self.META_HEADERS
                }
                target, _ = Target.objects.update_or_create(
                    canonical_name=self.build_canonical_name(row, rows),
                    defaults=dict(
                        zone=zone,
                        state=state,
                        type=type,
                        name=name,
                        coords=coords,
                        meta=meta,
                    ),
                )
                # clear off the target's work sites
                target.work_sites.set([])

                if meta.get("entity", {}).get("value"):
                    entity, _ = Entity.objects.update_or_create(
                        id=slugify(meta.get("entity").get("value")),
                        defaults={
                            "type": empresa_type,
                            "name": meta.get("entity").get("value"),
                            "meta": {},
                        },
                    )
                    if meta.get("work", {}).get("value"):
                        work_site, _ = WorkSite.objects.update_or_create(
                            entity=entity,
                            name=meta.get("work").get("value"),
                        )
                        # accumulate the work site
                        target.work_sites.add(work_site)
                targets += 1
            if verbosity > 0:
                self.stdout.write(self.style.SUCCESS(f"Loaded {targets} targets"))
