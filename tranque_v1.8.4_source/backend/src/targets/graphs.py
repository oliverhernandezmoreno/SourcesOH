import subprocess

from base.serializers import unfreeze


def render_graph(graph, output):
    subprocess.run(["dot", "-Tsvg"], input=graph.encode("utf-8"), stdout=output)


def serialize_graph(nodes, edges, forward=True, labelfn=None, attrfn=None):
    labelfn = (
        labelfn
        if labelfn is not None
        else lambda key, node: key
    )
    attrfn = (
        attrfn
        if attrfn is not None
        else lambda key, node: {}
    )

    def node_attrs(key, node):
        return "".join(
            f'[{label}="{value}"]'
            for label, value in (attrfn(key, node) or {}).items()
        )

    node_collection = [
        f'"{key}" [label="{labelfn(key, node)}"]{node_attrs(key, node)};'
        for key, node in nodes.items()
    ]
    edge_collection = [
        f'"{source}" -> "{destination}";' if forward else f'"{destination}" -> "{source}";'
        for source, destinations in edges.items()
        for destination in destinations
    ]
    newline = "\n"
    return f"strict digraph tree {{ {newline.join(node_collection)} {newline.join(edge_collection)} }}"


def build_raw_graph(timeseries, direction):
    """Builds a collection of nodes and edges given the 'root' time series
    and a direction to navigate (either 'inputs' or 'derivations').

    """
    assert direction in ("inputs", "derivations"), f"Invalid graph direction: {direction}"
    try:
        root_collection = [t for t in timeseries]
    except TypeError:
        root_collection = [timeseries]
    collection = {t.pk: t for t in root_collection}
    edges = {}

    def collect_children(ts):
        for subts in getattr(ts, direction).all():
            edges[subts.pk] = [*edges.get(subts.pk, []), ts.pk]
            if subts.pk not in collection:
                collection[subts.pk] = subts
                collect_children(subts)

    for root in root_collection:
        collect_children(root)
    return collection, edges


def build_flat_graph(timeseries, direction):
    """Returns a list of lists of timeseries, each nested list
    representing a level of the graph.

    """
    try:
        root_collection = [t for t in timeseries]
    except TypeError:
        root_collection = [timeseries]
    collection, edges = build_raw_graph(root_collection, direction)
    inverse_edges = {
        source: [
            target
            for target in edges
            if source in edges[target]
        ]
        for sources in edges.values()
        for source in sources
    }
    levelled_collection = {t.pk: 0 for t in root_collection}
    signature = frozenset(levelled_collection)
    expected = frozenset(collection)
    delta = signature
    while signature != expected:
        for t in delta:
            for nt in inverse_edges.get(t, []):
                if all(source in levelled_collection for source in edges.get(nt, [])):
                    levelled_collection[nt] = max(
                        (levelled_collection[source] for source in edges.get(nt, [])),
                        default=0,
                    ) + 1
        new_signature = frozenset(levelled_collection)
        delta = new_signature - signature
        if not delta:
            raise RuntimeError("graph is not connected")
        signature = new_signature
    return [
        group
        for _, group in sorted({
            level: [
                collection[t]
                for t, i in levelled_collection.items()
                if i == level
            ]
            for level in set(levelled_collection.values())
        }.items(), key=lambda pair: pair[0])
    ]


def make_graph(timeseries, direction):
    """Builds a serialized time series graph starting at the given time
    series.

    """
    collection, edges = build_raw_graph(timeseries, direction)
    return serialize_graph(
        collection,
        edges,
        forward=(direction == "inputs"),
        labelfn=lambda _, ts: "\\n".join(ts.canonical_name.split(".")),
    )


def graph(timeseries, response, direction="inputs"):
    render_graph(make_graph(timeseries, direction), response)


def stringify_groups(groups):
    groups = unfreeze(groups)
    key = "parents" if "parents" in groups else "items"
    return "".join([
        key[0],
        ": ",
        ", ".join(g["canonical_name"] for g in groups.get(key, []))
    ])


def make_template_graph(variant, direction):
    """Builds a serialized template graph starting at the templates with
    the given names.

    """
    from targets.models import Timeseries
    from targets.profiling import FOREST
    template_names = [variant] if isinstance(variant, str) else variant

    nodes = {
        node.value.canonical_name: node
        for node in FOREST.values()
        if node.value.canonical_name in template_names
    }
    missing = [t for t in template_names if t not in nodes]
    if missing:
        raise ValueError(f"({', '.join(missing)}) aren't templates")

    edges = {}

    def collect_children(n):
        for subn in (
                n.inputs
                if direction == "inputs"
                else (
                    candidate
                    for candidate in FOREST.values()
                    if n in candidate.inputs
                )
        ):
            edges[subn.value.canonical_name] = [
                *edges.get(subn.value.canonical_name, []),
                n.value.canonical_name,
            ]
            if subn.value.canonical_name not in nodes:
                nodes[subn.value.canonical_name] = subn
                collect_children(subn)

    roots = list(nodes.values())
    for node in roots:
        collect_children(node)
    return serialize_graph(
        nodes,
        edges,
        forward=(direction == "inputs"),
        labelfn=lambda key, node: "\\n".join(filter(bool, [
            *key.split("."),
            "-----" if node.value.scope is not None else None,
            stringify_groups(node.value.groups) if node.value.scope is not None else None,
        ])),
        attrfn=lambda key, node: {
            "style": (
                "filled"
                if (node.value.script or "").strip() or node.value.type in (
                    Timeseries.TimeseriesType.RAW,
                    Timeseries.TimeseriesType.MANUAL,
                )
                else ""
            ),
            "penwidth": 2,
            "color": {
                (None, False): "#d3d3d3",
                (None, True): "#a8a8a8",
                ("group", False): "#add8e6",
                ("group", True): "#34b9e5",
                ("spread", False): "#ffc04c",
                ("spread", True): "#ffa500",
            }.get((node.value.scope, bool(node.value.space_coords))),
        },
    )


def template_graph(names, response, direction="inputs"):
    render_graph(make_template_graph(names, direction), response)


def make_target_graph(target):
    """Builds a serialized graph of data sources and data source groups
    linked to the target.

    """
    source_nodes = {
        f"s/{source.id}": source
        for source in target.data_sources.prefetch_related("groups").all()
    }
    group_nodes = {
        f"g/{group.id}": group
        for group in target.data_source_groups.prefetch_related("parents").all()
    }
    nodes = {
        **source_nodes,
        **group_nodes,
        f"t/{target.id}": target
    }

    edges = {}
    for s in source_nodes.values():
        edges[f"s/{s.id}"] = [
            *(f"g/{g.id}" for g in s.groups.all()),
            f"t/{target.id}"
        ]
    for g in group_nodes.values():
        edges[f"g/{g.id}"] = [
            *(f"g/{p.id}" for p in g.parents.all()),
            f"t/{target.id}"
        ]

    return serialize_graph(
        nodes,
        edges,
        labelfn=lambda key, node: node.hardware_id
        if key.startswith("s/")
        else node.canonical_name,
        attrfn=lambda key, _: {
            "style": "filled",
            "penwidth": 2,
            "color": {
                "t/": "#d3d3d3",
                "g/": "#add8e6",
                "s/": "#ffc04c",
            }.get(key[:2]),
        },
    )


def target_graph(target, response):
    render_graph(make_target_graph(target), response)
