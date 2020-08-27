import tempfile
from pathlib import Path

import xlsxwriter as xlsx

CHUNK_SIZE = 1024 * 100


def make_sheet_name(form_version, index=1):
    """Returns an excel-valid sheet name for the given time series.

    """
    suffix = (
        f'{form_version.form.codename} - {form_version.code}'
    )
    return str(index).zfill(2) + " " + suffix


def get_field(field, section):
    if field['type'] == 'table':
        rows = [
            '-'.join(labels)
            for labels in zip(*[
                [
                    f'{col["header"]}[{r}]'
                    for r in col['values']
                ] for col in field['columns'] if col['type'] == 'label'
            ])
        ]
        # answer[table] keys are in form '{index_row}-{index_col}'
        for index_col, col in enumerate(field['columns']):
            if col['type'] != 'label':
                for index_row, row in enumerate(rows):
                    yield {
                        'type': field['type'],
                        'key': f'{field["key"]}.{index_row}-{index_col}',
                        'label': f'{col["header"]}({row})',
                        'section': section['title']
                    }
    else:
        yield {
            'type': field['type'],
            'key': field['key'],
            'label': field['label'] if 'label' in field else section['title'],
            'section': section['title']
        }


def get_fields(schema):
    for step in schema['steps']:
        for section in step['sections']:
            for field in section['fields']:
                yield from get_field(field, section)


def get_value(field, answers):
    value = ''
    if field['type'] == 'table':
        keys = field['key'].split('.')
        if keys[0] in answers and isinstance(answers[keys[0]], dict) and keys[1] in answers[keys[0]]:
            value = answers[keys[0]][keys[1]]
    elif field['key'] in answers:
        if isinstance(answers[field['key']], dict) and 'value' in answers[field['key']]:
            value = answers[field['key']]['value']
        else:
            value = answers[field['key']]
    return str(value)


def write_excel_file(filename, form_versions, form_instances):
    """Writes the excel contents into a file named *filename*, according
    to queryset and the base timestamp given.

    """
    with xlsx.Workbook(filename) as workbook:
        bold = workbook.add_format({"bold": 1})
        for index, version in enumerate(form_versions, start=1):
            # filter version instances
            version_instances = form_instances.filter(version=version)
            if not version_instances.exists():
                # do not add worksheet if there are no instances
                continue

            sheet = workbook.add_worksheet(make_sheet_name(version, index))

            schema = version.form_schema
            fields = list(get_fields(schema))

            # write headers
            sheet.write(1, 0, "instance id", bold)
            current_section = ''
            for col, field in enumerate(fields, start=1):
                # write section title
                if current_section != field['section']:
                    current_section = field['section']
                    sheet.set_column(0, col, 33)
                    sheet.write(0, col, field['section'], bold)
                sheet.write(1, col, field['label'], bold)

            # write one instance per row
            row = 2
            for instance in version_instances:
                sheet.write(row, 0, instance.id)
                answers = getattr(instance, 'answer', {})
                for col, field in enumerate(fields, start=1):
                    sheet.write(row, col, get_value(field, answers))
                row += 1


def export_form(form_versions, form_instances):
    """Returns an open file object with the exported data.
    """

    try:
        _, inner_filename = tempfile.mkstemp(suffix=".xlsx")
        write_excel_file(inner_filename, form_versions, form_instances)
        output = tempfile.TemporaryFile()
        with open(inner_filename, "rb") as inner:
            while True:
                chunk = inner.read(CHUNK_SIZE)
                if not chunk:
                    break
                output.write(chunk)
        output.seek(0)
        return output
    finally:
        Path(inner_filename).unlink()
