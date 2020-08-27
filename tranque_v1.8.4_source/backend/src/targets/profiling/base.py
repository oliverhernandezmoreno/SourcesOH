from collections import namedtuple
import logging
import warnings

from django.db import transaction

from base.serializers import freeze, unfreeze
from targets.models import DataSourceGroup
from targets.models import Frequency
from targets.models import MeasurementProtocol
from targets.models import MeasurementUnit
from targets.models import Threshold
from targets.models import Timeseries

logger = logging.getLogger(__name__)

N = namedtuple("N", ("value", "inputs"))
V = namedtuple("V", (
    "name",
    "canonical_name",
    "category",  # an arbitrary text field used for filtering
    "description",
    "highlight",
    "type",
    "space_coords",
    "choices",
    "unit",
    "x_unit",
    "y_unit",
    "z_unit",
    "script",
    "script_version",
    "range_gte",
    "range_gt",
    "range_lte",
    "range_lt",
    "thresholds",
    "scope",
    "groups",
    "frequencies",
    "meta",
))


def Node(**kwargs):
    keys = set(V._fields) | set(["inputs"])
    values = {
        **{k: None for k in keys},
        **kwargs
    }
    assert values["name"] is not None
    assert values["canonical_name"] is not None
    if values["inputs"]:
        values["type"] = Timeseries.TimeseriesType.DERIVED
    if values["type"] is None:
        values["type"] = Timeseries.TimeseriesType.RAW
    assert values["type"] in set(
        t for t, _ in Timeseries.TimeseriesType.choices
    ), f"invalid type for {values['canonical_name']}: {values['type']}"
    values["script"] = values["script"] or ""
    assert values["scope"] in (None, "spread", "group"), \
        f"invalid scope for {values['canonical_name']}"
    return N(
        V(**{k: freeze(v) for k, v in values.items() if k in V._fields}),
        tuple(values["inputs"] or []),
    )


def serialize_node(node):
    "Returns a JSON-serializable representation for the node *n*."
    return {
        **{
            k: unfreeze(v)
            for k, v in node.value._asdict().items()
            if k != "script"
        },
        "inputs": [
            child.value.canonical_name
            for child in (node.inputs or [])
        ],
    }


def persist_unit(data):
    unit, _ = MeasurementUnit.objects.update_or_create(
        id=data["id"],
        defaults={
            k: v
            for k, v in data.items()
            if k != "id"
            if k != "si_unit"
        },
    )
    parent = persist_unit(data.get("si_unit")) if data.get("si_unit") else None
    unit.si_unit = parent
    unit.save()
    return unit


def persist_intersection(target, groups):
    "Join groups together into an intersection group."
    intersection, _ = DataSourceGroup.objects.update_or_create(
        target=target,
        canonical_name=f"int-{'-'.join(sorted(g.canonical_name for g in groups))}",
        defaults={
            "name": f"INTERSECTION ({', '.join(g.name for g in groups)})",
        },
    )
    # Collect all sources in all of the groups
    sources = groups[0].data_sources.all() if groups else []
    for dsg in groups[1:]:
        new_sources = set(ds.id for ds in dsg.data_sources.all())
        sources = [s for s in sources if s.id in new_sources]
    for ds in sources:
        ds.groups.add(intersection)
        ds.save()
    # Set parents if all groups have a them in common
    parents = groups[0].parents.all() if groups else []
    for dsg in groups[1:]:
        new_parents = set(g.id for g in dsg.parents.all())
        parents = [g for g in parents if g.id in new_parents]
    intersection.parents.set(parents)
    return intersection


def get_or_create_groups(target, groups):
    return [
        dsg
        for dsg, _ in (
            DataSourceGroup.objects.get_or_create(
                target=target,
                canonical_name=group["canonical_name"],
                defaults={
                    "name": group.get("name", ""),
                    "meta": group.get("meta"),
                },
            )
            for group in groups
        )
    ]


def persist_groups(scope, target, groups):
    if "parents" in groups:
        parents = get_or_create_groups(target, groups["parents"])
        qs = (
            DataSourceGroup.objects
            .filter(target=target, parents__in=parents)
            .prefetch_related("parents")
        )
        # all parents must be so for all children: the above query
        # doesn't perform that check (it's a left join), meaning there
        # could be children with only few of the required parents; the
        # check must be made explicitly here
        dsgs = list(set([
            g
            for g in qs
            if all(p.id in set(gp.id for gp in g.parents.all()) for p in parents)
        ]))
        if len(dsgs) == 0:
            warnings.warn(f"No data source group found for parent lookup {groups}", UserWarning)
    elif "items" in groups:
        dsgs = get_or_create_groups(target, groups["items"])
    else:
        raise RuntimeError(f"groups specification {groups} doesn't specify either a 'parents' or 'items' attribute")

    if scope == "group" and groups.get("operator") == "and":
        # the intersection needs to be built explicitly (the 'spread'
        # scope doesn't need this, since the spreading itself is the
        # action to be restricted)
        dsgs = [persist_intersection(target, dsgs)]

    for dsg in dsgs:
        if not dsg.data_sources.exists():
            warnings.warn(f"DataSourceGroup {dsg} doesn't have any registered data sources", UserWarning)
    return dsgs


GROUP_PREFIX = "g-"
SOURCE_PREFIX = "s-"


def persist_timeseries(
        node,
        unit,
        x_unit,
        y_unit,
        z_unit,
        groups,
        target,
        **_):
    # [(prefix, data source, data source group)]
    spread = (
        (("none", None, None),)
        if node.scope is None
        else (
            set(
                (f"{GROUP_PREFIX}{group.canonical_name}", None, group)
                for group in groups
            )
            if node.scope == "group"
            else set(
                (f"{SOURCE_PREFIX}{ds.hardware_id}", ds, group)
                for group in groups
                for ds in group.data_sources.all()
            )
        )
    )
    if node.scope == "spread" and unfreeze(node.groups).get("operator") == "and":
        spread = set(
            (term, ds, group)
            for term, ds, group in spread
            if all(
                ds.id in set(ds_in_group.id for ds_in_group in g.data_sources.all())
                for g in groups
                if g is not group
            )
        )
    for namespace_suffix, data_source, data_source_group in spread:
        ts, _ = Timeseries.objects.update_or_create(
            canonical_name=".".join([
                target.canonical_name,
                namespace_suffix,
                node.canonical_name,
            ]),
            defaults={
                "name": node.name,
                "description": node.description,
                "template_name": node.canonical_name,
                "highlight": not (not node.highlight),
                "type": node.type,
                "space_coords": node.space_coords,
                "choices": unfreeze(node.choices),
                "unit": unit,
                "x_unit": x_unit,
                "y_unit": y_unit,
                "z_unit": z_unit,
                "script": node.script,
                "script_version": node.script_version,
                "range_gte": node.range_gte,
                "range_gt": node.range_gt,
                "range_lte": node.range_lte,
                "range_lt": node.range_lt,
                "data_source": data_source,
                "data_source_group": data_source_group,
                "target": target,
            },
        )
        yield ts


def persist_thresholds(tss, thresholds):
    # Select timeseries that don't have thresholds pre-defined
    predefined = set(
        Threshold.objects
        .filter(timeseries__in=tss)
        .values_list("timeseries_id", flat=True),
    )
    Threshold.objects.bulk_create([
        Threshold(**{**th, "timeseries": ts})
        for ts in tss
        if ts.id not in predefined
        for th in thresholds
    ])


def persist_frequencies(tss, frequencies):
    for f in frequencies:
        protocol, _ = (
            MeasurementProtocol.objects.get_or_create(id=f["protocol"])
            if f.get("protocol") is not None
            else (None, False)
        )
        # Select timeseries that don't have frequencies pre-defined
        predefined = set(
            Frequency.objects
            .filter(timeseries__in=tss, protocol=protocol)
            .values_list("timeseries_id", flat=True),
        )
        Frequency.objects.bulk_create([
            Frequency(timeseries=ts, **{**f, "protocol": protocol})
            for ts in tss
            if ts.id not in predefined
        ])


def flatten_tree(tree):
    """Flattens the tree into a set of nodes and a dictionary of
    *parents*, the reverse relationship of *inputs* (the given
    relationship). This procedure assumes a non-cyclical graph (a proper
    tree).

    """
    nodes = set([tree.value])
    parents = {tree.value: []}

    def collect(root):
        for node in root.inputs:
            nodes.add(node.value)
            parents[node.value] = [root.value, *(parents.get(node.value, []))]
            collect(node)

    collect(tree)
    return nodes, parents


def spread_node(node, target):
    """Spreads the template represented by *node* as timeseries linked to
    *target*.

    """
    unit = persist_unit(unfreeze(node.unit)) if node.unit else None
    x_unit = persist_unit(unfreeze(node.x_unit)) if node.x_unit else None
    y_unit = persist_unit(unfreeze(node.y_unit)) if node.y_unit else None
    z_unit = persist_unit(unfreeze(node.z_unit)) if node.z_unit else None
    groups = persist_groups(node.scope, target, unfreeze(node.groups)) if node.scope is not None else None
    tss = list(persist_timeseries(**locals()))
    if node.thresholds is not None:
        persist_thresholds(tss, unfreeze(node.thresholds))
    if node.frequencies is not None:
        persist_frequencies(tss, unfreeze(node.frequencies))
    return tss


def is_graph_edge(child, parent):
    """Determines whether child and parent form a timeseries dependency
    after spreading.

    """
    child_ts, child_node = child
    parent_ts, parent_node = parent
    if child_node.scope is None or parent_node.scope is None:
        return True
    if child_node.scope == "spread" and parent_node.scope == "spread":
        return child_ts.data_source_id == parent_ts.data_source_id
    if child_node.scope == "group" and parent_node.scope == "spread":
        return child_ts.data_source_group.data_sources.filter(id=parent_ts.data_source_id).exists()
    if child_node.scope == "spread" and parent_node.scope == "group":
        return parent_ts.data_source_group.data_sources.filter(id=child_ts.data_source_id).exists()
    if child_node.scope == "group" and parent_node.scope == "group":
        # three cases:
        # - the groups are equal
        # - the first group is a child of the second
        # - the second group is a child of the first
        return (
            child_ts.data_source_group.id == parent_ts.data_source_group.id
        ) or (
            child_ts.data_source_group.children
            .filter(id__exact=parent_ts.data_source_group.id)
            .exists()
        ) or (
            parent_ts.data_source_group.children
            .filter(id__exact=child_ts.data_source_group.id)
            .exists()
        )
    return False


@transaction.atomic
def apply(tree, target, previously_applied=None):
    """Installs the templates rooted at *tree* as time series linked to
    *target*. Overlap with previous applications of this procedure can
    be controlled with *previously_applied*, which must be a set which
    will accumulate state.

    """
    if previously_applied is None:
        previously_applied = set()

    nodes, parents = flatten_tree(tree)

    # partition based on previously_applied
    new_nodes, old_nodes = set(), set()
    for node in nodes:
        (
            old_nodes
            if node in previously_applied
            else new_nodes
        ).add(node)

    # persist and build a mapping (node -> [timeseries])
    timeseries = {}
    for node in new_nodes:
        timeseries[node] = spread_node(node, target)
    for node in old_nodes:
        timeseries[node] = (
            Timeseries.objects
            .select_related("data_source_group")
            .prefetch_related("derivations")
            .filter(target=target, template_name=node.canonical_name)
        )

    # persist parent relationship
    for node in nodes:
        for ts in timeseries[node]:
            if node in previously_applied and \
               all(parent in previously_applied for parent in parents[node]):
                continue
            linked = [
                parent_ts
                for parent in parents[node]
                for parent_ts in timeseries[parent]
                if is_graph_edge((ts, node), (parent_ts, parent))
            ]
            linked_ids = set(map(lambda t: t.id, linked))
            ts.derivations.set([
                *linked,
                *(
                    old_link
                    for old_link in ts.derivations.all().only("id")
                    # keep old links that weren't just established
                    if old_link.id not in linked_ids
                ),
            ])
            ts.save()

    return nodes
