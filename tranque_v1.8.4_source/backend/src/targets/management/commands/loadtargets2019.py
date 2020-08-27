import xlrd
from pathlib import Path
from itertools import islice

from django.utils.text import slugify
from targets.management.commands.loadtargets import Command as LoadTargetsCommand


class Command(LoadTargetsCommand):
    DEFAULT_SOURCE = Path(__file__).parent / "data" / "depositos2019.xls"
    DEFAULT_OFFSET = 0

    COMMUNE_HEADER = "COMUNA_INS"

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

    TARGET_NAME_HEADER = "NOMBRE_INS"
    TARGET_TYPE_HEADER = "TIPO_INSTA"
    TARGET_STATE_HEADER = "ESTADO_INS"
    UTM_NORTH_HEADER = "UTM_NORTE"
    UTM_EAST_HEADER = "UTM_ESTE"
    META_HEADERS = (
        ("OBJECTID", "id_sngm"),
        ("NOMBRE_EMP", "entity"),
        ("NOMBRE_FAE", "work"),
        ("RECOBRERSO", "resource"),
        ("VOL_AUTORIZADO", "approved_volume"),
        ("VOL_ACTUAL", "current_volume"),
        ("TON_AUTORIZADO", "approved_tons"),
        ("TON_ACTUAL", "current_tons"),
        ("METODO_CONS", "constructive_method"),
        ("RES_APRUEBA", "approval_resolution"),
        ("RES_APRUEBA_FECHA", "approval_resolution_date"),
        ("RES_PDC_APRUEBA", "pdc_approval_resolution"),
        ("RES_PDC_FECHA", "pdc_approval_resolution_date"),
    )

    OPEN_OPTIONS = {'encoding_override': 'utf-8'}

    def encode_enie(self, word):
        if isinstance(word, str):
            return bytes(word, 'utf-8')\
                .replace(b'\xc3\x83\xe2\x80\x98', bytes('Ñ', 'utf-8'))\
                .replace(b'A\xc3\x82\xc2\x81', bytes('Á', 'utf-8'))\
                .replace(b'I\xc3\x82\xc2\x8d', bytes('Í', 'utf-8'))\
                .decode('utf-8')
        return word

    def load_source(self, source, offset):
        sheet = xlrd.open_workbook(source, **self.OPEN_OPTIONS).sheet_by_index(0)
        rows = islice(sheet.get_rows(), offset, None)
        headers = [cell.value for cell in next(rows)]
        return (
            dict((k, self.encode_enie(v)) for k, v in zip(headers, [cell.value for cell in row]) if k)
            for row in rows
        )

    def canonical_name_attempt_catalog(self, full_vector):
        return tuple(full_vector[:i] for i, _ in enumerate(full_vector, start=1))

    def build_canonical_name(self, row, rows):
        full_vector = (
            self.TARGET_NAME_HEADER,
            self.META_HEADERS[0][0]
        )

        for attempt in self.canonical_name_attempt_catalog(full_vector):
            slug = slugify(" ".join(str(row[k]) for k in attempt))
            pool = [s for s in (slugify(" ".join(str(r[k]) for k in attempt)) for r in rows) if s == slug]
            if len(pool) == 1:
                return slug
        raise RuntimeError(f"no unique canonical name could be built for {row}")
