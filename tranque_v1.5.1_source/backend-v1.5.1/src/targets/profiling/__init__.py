import json
import logging
from pathlib import Path

import yaml
from django.conf import settings
from django.db.models import Count

from targets.models import Parameter
from targets.models import Timeseries
from targets.profiling.base import Node
from targets.profiling.base import apply as apply_node

logger = logging.getLogger(__name__)


def get_parser():
    if settings.PROFILES_FORMAT == "json":
        return json.load
    if settings.PROFILES_FORMAT in ("yml", "yaml"):
        return lambda input: yaml.load(input, Loader=yaml.FullLoader)
    raise RuntimeError(f"profiles format '{settings.PROFILES_FORMAT}' is not supported")


def load_manifest(f):
    try:
        with open(f) as manifest:
            return json.load(manifest)
    except Exception as e:
        raise RuntimeError(f"couldn't read manifest file at {f}: {e}")


def load_raw_node(f):
    try:
        with open(f) as raw_node:
            return get_parser()(raw_node)
    except Exception as e:
        raise RuntimeError(f"couldn't read profile file at {f}: {e}")


def expand_wildcards(base_dir, raw_profile):
    if isinstance(raw_profile, str):
        if raw_profile.endswith("/*"):
            spread_at = base_dir / raw_profile.lstrip("@")[:-2]
            return [
                "/".join(node.relative_to(base_dir).parts)[:-(len(settings.PROFILES_FORMAT) + 1)]
                for node in spread_at.iterdir()
                if node.is_file()
                if node.name.endswith(f".{settings.PROFILES_FORMAT}")
            ]
        return [raw_profile]
    inputs = raw_profile.get("inputs", [])
    return [{
        **raw_profile,
        "inputs": [
            expanded
            for child in inputs
            for expanded in expand_wildcards(base_dir, child)
        ]
    }]


def is_pure(raw_profile):
    return not any(
        isinstance(child, str)
        for child in raw_profile.get("inputs", [])
    ) and all(
        is_pure(child)
        for child in raw_profile.get("inputs", [])
        if not isinstance(child, str)
    )


def build_pure(raw_profile, overrides=None):
    return Node(**{**raw_profile, **(overrides or {}), "inputs": [
        build_pure(child, overrides=overrides)
        for child in raw_profile.get("inputs", [])
        if not isinstance(child, str)
    ]})


def references(raw_profile):
    if isinstance(raw_profile, str):
        return [raw_profile.lstrip("@")]
    return [
        ref
        for child in raw_profile.get("inputs", [])
        for ref in references(child)
    ]


def build_referenced(raw_profile, built, overrides=None):
    if isinstance(raw_profile, str):
        return built[raw_profile.lstrip("@")]
    return Node(**{**raw_profile, **(overrides or {}), "inputs": [
        build_referenced(child, built, overrides=overrides)
        for child in raw_profile.get("inputs", [])
    ]})


def init(**overrides):
    raw_profiles = {
        name: raw_profile
        for name, raw_profile in (
            ("/".join(p.relative_to(Path(settings.PROFILES_BASE)).parts)[
             0:-(len(settings.PROFILES_FORMAT) + 1)
             ], load_raw_node(p))
            for p in Path(settings.PROFILES_BASE).glob(f"**/*.{settings.PROFILES_FORMAT}")
            if p.is_file()
        )
        if isinstance(raw_profile, dict)
    }
    # expand wildcards that may be present within some references
    raw_profiles = {
        name: expanded
        for name, profile in raw_profiles.items()
        for expanded in expand_wildcards(Path(settings.PROFILES_BASE), profile)
    }
    # annotate them with canonical names mapped to their location
    raw_profiles = {
        name: {**raw_profile, "canonical_name": ".".join(name.split("/"))}
        for name, raw_profile in raw_profiles.items()
    }

    # build the forest incrementally
    forest = {
        name: build_pure(raw_profile, overrides=overrides)
        for name, raw_profile in raw_profiles.items()
        if is_pure(raw_profile)
    }

    while frozenset(forest) != frozenset(raw_profiles):
        change = False
        forest_keys = frozenset(forest)
        for name, raw_profile in ((n, p) for n, p in raw_profiles.items() if n not in forest_keys):
            refs = references(raw_profile)
            if all(ref in forest for ref in refs):
                forest[name] = build_referenced(raw_profile, forest, overrides=overrides)
                change = True
        if not change:
            raise RuntimeError(
                "profile graph is either cyclical (it can't be) or a reference is broken; "
                f"remaining nodes are {', '.join(frozenset(raw_profiles) - frozenset(forest))}"
            )

    return forest


# All collected nodes, templates for future time series
FOREST = init()


def get_nodes_by(attribute, value):
    return list(
        n
        # make the attribute always an interable
        for attr, n in (
            (
                tuple([attr]) if not isinstance(attr, (tuple, list)) else attr,
                n
            )
            for attr, n in (
                (getattr(node.value, attribute, None), node)
                for node in FOREST.values()
            )
        )
        # check the value is not iterable and is inside attr
        if (not isinstance(value, (tuple, list)) and value in attr) or
        # check the value is an iterable and intersects attr
        (isinstance(value, (tuple, list)) and all(v in attr for v in value))
    )


# All manifests, descriptions for collection of tied templates
MANIFESTS = {
    p.name[0:-len(".manifest")]: load_manifest(p)
    for p in Path(settings.PROFILES_BASE).glob("**/*.manifest")
    if p.is_file()
}


def apply_manifest(manifest, target):
    """Applies the template manifest to the target, sequentially applying
    the trees referenced in the entrypoints of the manifest.

    """
    entrypoints = manifest.get("entrypoints", [])
    if not entrypoints:
        raise RuntimeError("No entrypoint registered for the manifest")
    logger.info(f"Applying manifest entrypoints: {', '.join(entrypoints)}")
    node_application_state = set()
    for entrypoint in entrypoints:
        node = next(
            (
                node
                for node in FOREST.values()
                if node.value.canonical_name == entrypoint
            ),
            None,
        )
        if node is None:
            raise RuntimeError(f"Entrypoint {entrypoint} is not present in FOREST")
        previous_nodes = len(node_application_state)
        applied_nodes = apply_node(node, target, previously_applied=node_application_state)
        node_application_state.update(applied_nodes)
        current_nodes = len(node_application_state)
        logger.info(f"Applied entrypoint {entrypoint} ({current_nodes - previous_nodes} new nodes)")

    if manifest.get("version") is not None:
        _, pruned = Timeseries.objects.filter(
            target=target,
            script_version__startswith=f"{manifest.get('name')}:"
        ).exclude(
            script_version=manifest.get("version")
        ).delete()
        logger.info(f"Deleted {pruned.get('targets.Timeseries', 0)} old timeseries")
        trimmed_count = 1
        while trimmed_count > 0:
            _, isolated = Timeseries.objects.filter(
                target=target,
                script_version=manifest.get("version"),
                type=Timeseries.TimeseriesType.DERIVED,
                template_name__in=list(set(
                    template.value.canonical_name
                    for template in FOREST.values()
                    if template.value.script_version == manifest.get("version")
                    if template.inputs
                ))
            ).annotate(inputs_count=Count("inputs")).filter(
                inputs_count=0
            ).delete()
            trimmed_count = isolated.get('targets.Timeseries', 0)
            logger.info(f"Deleted {trimmed_count} isolated timeseries")

    for canonical_name, parameter in manifest.get("parameters", {}).items():
        p, created = Parameter.objects.update_or_create(
            target=target,
            canonical_name=canonical_name,
            defaults={
                "name": parameter.get("name"),
            },
        )
        if created and "value" in parameter:
            p.value = parameter.get("value")
            p.save()
    if manifest.get("parameters"):
        logger.info(f"Declared {len(manifest.get('parameters'))} parameters")
