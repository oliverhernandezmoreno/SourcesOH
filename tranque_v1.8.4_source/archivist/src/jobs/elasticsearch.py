from itertools import zip_longest
import json
import logging

from elasticsearch import Elasticsearch

from conf import settings

logger = logging.getLogger(__name__)


def _client():
    return Elasticsearch([
        "".join((
            settings.ELASTICSEARCH_PROTOCOL,
            "://",
            *(
                [settings.ELASTICSEARCH_USER, ":", settings.ELASTICSEARCH_PASSWORD, "@"]
                if settings.ELASTICSEARCH_USER
                else []
            ),
            settings.ELASTICSEARCH_HOST,
            ":",
            settings.ELASTICSEARCH_PORT,
            "/",
        )),
    ])


def check():
    """Checks whether a connection to elasticsearch can be established.

    """
    return _client().info()


def _export_hit(hit):
    return {
        "_index": hit.get("_index"),
        "_id": hit.get("_id"),
        "_source": hit.get("_source"),
    }


def _unscroll(pattern):
    page_size = 100
    scroll_ids = set()
    page = _client().search(index=pattern, size=page_size, scroll="1m")
    scroll_id = page.get("_scroll_id")
    scroll_ids.add(scroll_id)
    hits = page.get("hits", {}).get("hits", [])
    for hit in hits:
        yield _export_hit(hit)

    while len(hits) == page_size:
        page = _client().scroll(scroll_id=scroll_id, scroll="1m")
        scroll_id = page.get("_scroll_id")
        scroll_ids.add(scroll_id)
        hits = page.get("hits", {}).get("hits", [])
        for hit in hits:
            yield _export_hit(hit)

    scroll_ids = list(filter(bool, scroll_ids))
    if scroll_ids:
        _client().clear_scroll(scroll_id=",".join(scroll_ids))


def backup(base, id):
    """Performs a backup in two steps: get all templates, and then scroll
    for each index pattern.

    """
    templates = _client().indices.get_template()
    with open(base / f"templates-{id}.json", "w") as templates_file:
        json.dump(templates, templates_file)

    for name, template in templates.items():
        patterns = template.get("index_patterns", [])
        if not patterns:
            logger.info(f"Template {name} doesn't have index patterns")
            continue
        logger.info(f"Dumping data for template {name}")
        with open(base / f"elasticsearch-{name}-{id}.ndjson", "w") as data_file:
            for pattern in patterns:
                for hit in _unscroll(pattern):
                    json.dump(hit, data_file)
                    data_file.write("\n")


# Source: https://docs.python.org/3/library/itertools.html#itertools-recipes
def _grouper(iterable, n, fillvalue=None):
    "Collect data into fixed-length chunks or blocks"
    # grouper('ABCDEFG', 3, 'x') --> ABC DEF Gxx"
    args = [iter(iterable)] * n
    return zip_longest(*args, fillvalue=fillvalue)


def restore(base, id, purge=False):
    """Performs a restore operation, expecting a 'templates' file and one
    data file for each template key. If *purge* is false (the
    default), this won't delete data already present in the database.

    """
    with open(base / f"templates-{id}.json") as templates_file:
        templates = json.load(templates_file)

    if purge:
        for pattern in set(p for template in templates.values() for p in template.get("index_patterns", [])):
            logger.info(f"Destroying old data for pattern {pattern}")
            _client().indices.delete(index=pattern, allow_no_indices=True)

    for name, template in templates.items():
        _client().indices.put_template(name=name, body=template)
        if not template.get("index_patterns", []):
            logger.info(f"Template {name} doesn't have index patterns")
            continue
        logger.info(f"Restoring data for template {name}")
        with open(base / f"elasticsearch-{name}-{id}.ndjson") as data_file:
            for batch in _grouper((json.loads(line) for line in data_file), 100):
                actions = [
                    nested
                    for pair in (
                        ({"index": {"_index": hit["_index"], "_id": hit["_id"]}}, hit["_source"])
                        for hit in batch
                        if hit is not None
                    )
                    for nested in pair
                ]
                _client().bulk(body=actions, **settings.ELASTICSEARCH_BULK_KWARGS)
                logger.debug(f"Indexed {len(actions) // 2} hits")
        logger.info(f"Finished restoring data for template {name}")
