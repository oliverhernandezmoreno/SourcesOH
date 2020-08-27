from pathlib import Path
import sys

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
import jsonschema
import yaml

import base.command_syntax as syntax
from targets.models import DataSource
from targets.models import DataSourceGroup
from targets.models import Parameter
from targets.models import Target
from targets.profiling import MANIFESTS


class Command(BaseCommand):
    help = "Loads data sources and data source groups from the specified YAML file"

    with open(Path(__file__).parent / "data" / "configuration.yml") as schema_file:
        SCHEMA = yaml.load(schema_file, Loader=yaml.FullLoader)

    def load_data(self, data_file):
        if data_file == "-":
            return yaml.load(sys.stdin, Loader=yaml.FullLoader)
        filepath = Path(data_file if data_file.endswith(".yml") else f"{data_file}.yml")
        if not filepath.is_absolute():
            filepath = Path(settings.BASE_DIR) / filepath
        with open(filepath) as f:
            return yaml.load(f, Loader=yaml.FullLoader)

    def add_arguments(self, parser):
        parser.add_argument("file", help="Path to the YAML data file ('-' for stdin)")
        parser.add_argument("target", nargs="?", help="The target's canonical name")

    def resolve_group(self, target, spec):
        if "import_from" in spec:
            manifest = MANIFESTS[spec.get("import_from")]
            imported_spec = next(iter([
                *(s for s in manifest["groups"] if s.get("canonical_name") == spec["canonical_name"]),
                *(s for s in manifest["metagroups"] if s.get("canonical_name") == spec["canonical_name"]),
            ]), None)
            if imported_spec is None:
                raise RuntimeError(f"group '{spec['canonical_name']}' not found in manifest '{spec['import_from']}'")
            spec = imported_spec
        group, _ = DataSourceGroup.objects.update_or_create(
            target=target,
            canonical_name=spec["canonical_name"],
            defaults={
                "name": spec["name"],
                "meta": spec.get("meta"),
            },
        )
        return spec, group

    @transaction.atomic
    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)

        spec = self.load_data(kwargs["file"])
        jsonschema.validate(spec, self.SCHEMA)
        target = Target.objects.get(canonical_name=kwargs.get("target") or spec["target"])

        tagged_groups = [
            self.resolve_group(target, group)
            for group in syntax.replaced_collection(
                spec.get("groups", []),
                extra={"target": [target.canonical_name]}
            )
        ]
        for group_spec, group in tagged_groups:
            parents = [
                g
                for _, g in tagged_groups
                if g.canonical_name in group_spec.get("parents", [])
            ]
            group.parents.set(parents)
            group.save()
        groups = [g for _, g in tagged_groups]

        if verbosity > 0 and spec.get("groups"):
            self.stdout.write(self.style.SUCCESS(
                f"Loaded {len(groups)} data source groups for {target.canonical_name}",
            ))

        sources = list(syntax.replaced_collection(
            spec.get("sources", []),
            extra={"target": [target.canonical_name]}
        ))

        for s in sources:
            selected_groups, missing_groups = [], []
            for g in s["groups"]:
                group_obj = next(
                    (group for group in groups if group.canonical_name == g),
                    None,
                )
                if group_obj is not None:
                    selected_groups.append(group_obj)
                else:
                    missing_groups.append(g)
            if missing_groups:
                raise ValueError(f"groups not found in spec: {', '.join(missing_groups)}")

            source, _ = DataSource.objects.update_or_create(
                target=target,
                hardware_id=s["hardware_id"],
                defaults={
                    "name": s["name"],
                    "canonical_name": s.get("canonical_name"),
                    "coords": s.get("coords"),
                    "type": s.get("type"),
                    "meta": s.get("meta"),
                },
            )
            source.groups.set(selected_groups)

        if verbosity > 0 and spec.get("sources"):
            self.stdout.write(self.style.SUCCESS(
                f"Loaded {len(sources)} data sources for {target.canonical_name}",
            ))

        parameters = list(syntax.replaced_collection(
            spec.get("parameters", []),
            extra={"target": [target.canonical_name]}
        ))
        for parameter in parameters:
            param, _ = Parameter.objects.update_or_create(
                target=target,
                canonical_name=parameter["canonical_name"],
                defaults={
                    "name": parameter.get("name"),
                    "value": parameter.get("value"),
                },
            )
            param.validate_value()
        if verbosity > 0 and spec.get("parameters"):
            self.stdout.write(self.style.SUCCESS(
                f"Loaded {len(parameters)} parameters for {target.canonical_name}",
            ))
