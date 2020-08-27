"""This module contains shortcuts for common queries.

"""
import elasticsearch_dsl as dsl


class Search(dsl.Search):
    """The main search interface for elasticsearch events. As a subclass
    of elasticsearch_dsl.Search, any traditional method may be used,
    as well as the shortcuts defined here.

    """

    def filter_by_name(self, name):
        return self.filter(
            "terms" if isinstance(name, (tuple, list)) else "term",
            name=name,
        )

    def filter_by_regexp(self, regexp):
        return self.filter("regexp", name=regexp)

    def filter_by_id(self, _id):
        return self.filter(
            "ids",
            values=_id if isinstance(_id, (tuple, list)) else [_id],
        )

    def filter_by_value_range(self, compare, v):
        return self.filter("range", value={compare: v})

    def filter_by_timestamp_range(self, compare, t):
        return self.filter("range", **{"@timestamp": {compare: t}})

    def filter_by_label(self, label, value):
        return self.filter(
            "nested",
            path="labels",
            score_mode="none",
            query={
                "bool": {
                    "filter": [
                        {"term": {"labels.key": label}},
                        {"term": {"labels.value": value}},
                    ],
                },
            },
        )

    def filter_by_label_regexp(self, label, regexp):
        return self.filter(
            "nested",
            path="labels",
            score_mode="none",
            query={
                "bool": {
                    "filter": [
                        {"term": {"labels.key": label}},
                        {"regexp": {"labels.value": regexp}},
                    ],
                },
            },
        )

    def filter_by_message(self, message_id):
        return self.filter_by_label("message-id", message_id)

    def filter_by_etloperation(self, operation_id):
        return self.filter_by_label("operation-id", operation_id)

    def filter_by_manifest(self, manifest):
        return self.filter_by_label_regexp("script-version", f"{manifest}:.*")
