from collections import namedtuple
from functools import lru_cache

from django.conf import settings
from elasticsearch import Elasticsearch

RAW_INDEX = "test" if settings.TESTING else "raw"
DERIVED_INDEX = "test" if settings.TESTING else "derived"


@lru_cache()
def connect():
    "A cached reference to the connection."
    return Elasticsearch(["".join((
        settings.ELASTICSEARCH_PROTOCOL,
        "://",
        *(
            [settings.ELASTICSEARCH_USER, ":", settings.ELASTICSEARCH_PASSWORD or "", "@"]
            if settings.ELASTICSEARCH_USER
            else []
        ),
        settings.ELASTICSEARCH_HOST,
        ":",
        str(settings.ELASTICSEARCH_PORT),
        "/",
    ))])


# Default fields to fetch from each event.
SOURCE_FIELDS = {
    "excludes": ["dependencies"],
}


def event_from_hit(hit):
    """Builds an event given an elasticsearch hit."""
    return {
        **hit["_source"],
        "_id": hit["_id"],
        "_version": hit["_version"],
    }


Response = namedtuple("Response", ("count", "hits", "aggregations"))


def msearch(searches, **kwargs):
    """Performs multiple searches in a single request"""
    if not searches:
        return []
    actions = [
        nested
        for pair in (
            ({"index": f"{DERIVED_INDEX}-*"},
             {
                 "_source": SOURCE_FIELDS,
                 "version": True,
                 **(search.to_dict() if hasattr(search, "to_dict") else search),
             })
            for search in searches
        )
        for nested in pair
    ]
    return [
        Response(
            count=response.get("hits", {}).get("total", {}).get("value", 0),
            hits=[
                event_from_hit(hit)
                for hit in response.get("hits", {}).get("hits", [])
            ],
            aggregations=response.get("aggregations", {}),
        ) for response in connect().msearch(body=actions, **kwargs)["responses"]
    ]


def search(body, **kwargs):
    """A single search"""
    return msearch([body], **kwargs)[0]


def delete(body, **kwargs):
    """Delete documents matching Search obj"""
    return connect().delete_by_query(
        index=f"{DERIVED_INDEX}-*",
        body=body.to_dict() if hasattr(body, "to_dict") else body,
        **kwargs
    )


def scan(body_variant, **kwargs):
    """Applies a search continuously until all results are fetched. Return
    an iterator over the hits.

    """
    body = (
        body_variant.to_dict()
        if hasattr(body_variant, "to_dict")
        else body_variant
    )
    edge = None
    while True:
        scan_body = {
            "_source": SOURCE_FIELDS,
            "version": True,
            **{k: v for k, v in body.items() if k != "from"},
            "sort": [*body.get("sort", []), {"_id": "desc"}],
            **({"search_after": edge} if edge is not None else {}),
        }
        response = connect().search(**{**kwargs, "body": scan_body, "index": f"{DERIVED_INDEX}-*"})
        hits = response["hits"]["hits"]
        for hit in hits:
            yield event_from_hit(hit)
        if not hits:
            break
        edge = hits[-1]["sort"]


def partition_for(doc):
    return ".".join(doc["@timestamp"][:7].split("-"))


# Elasticsearch meta-fields https://www.elastic.co/guide/en/elasticsearch/reference/7.3/mapping-fields.html
RESERVED_FIELDS = {
    "_index",
    "_type",
    "_id",
    "_source",
    "_size",
    "_field_names",
    "_ignored",
    "_routing",
    "_meta",
    "_version",
}


def index(doc, **kwargs):
    """Persist a document"""
    index_name = f"{RAW_INDEX if '_id' not in doc else DERIVED_INDEX}-{partition_for(doc)}"
    return connect().index(**{
        **kwargs,
        "body": {k: v for k, v in doc.items() if k not in RESERVED_FIELDS},
        **({"id": doc.get("_id")} if "_id" in doc else {}),
        "index": index_name,
    })


def bulk_index(docs, **kwargs):
    """Persist a bulk of documents
    to raw index if document does not have an '_id' field
    to derived index if document has an '_id' field
    """
    if not docs:
        return None
    actions = [
        nested
        for pair in (
            (
                {"index": {
                    "_index": f"{RAW_INDEX if '_id' not in doc else DERIVED_INDEX}-{partition_for(doc)}",
                    **({"_id": doc.get("_id")} if "_id" in doc else {})
                }},
                {k: v for k, v in doc.items() if k not in RESERVED_FIELDS}
            )
            for doc in docs
        )
        for nested in pair
    ]
    return connect().bulk(body=actions, **kwargs)
