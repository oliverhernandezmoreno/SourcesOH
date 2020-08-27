NO_EMPTY_STRING = {
    'type': 'string',
    'minLength': 1
}

# 'text'
TEXT_FIELD_SCHEMA = {
    'type': 'object',
    'properties': {
        'type': {'type': 'string', 'enum': ['text']},
        'key': NO_EMPTY_STRING,
        'label': NO_EMPTY_STRING,
        'suffix': {'type': 'string'},
    },
    'required': ['type', 'key', 'label']
}

# 'textarea'
TEXTAREA_FIELD_SCHEMA = {
    'type': 'object',
    'properties': {
        'type': {'type': 'string', 'enum': ['textarea']},
        'key': NO_EMPTY_STRING,
        'label': NO_EMPTY_STRING,
    },
    'required': ['type', 'key', 'label']
}

# 'checkbox'
CHECKBOX_FIELD_SCHEMA = {
    'type': 'object',
    'properties': {
        'type': {'type': 'string', 'enum': ['checkbox']},
        'key': NO_EMPTY_STRING,
        'options': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
                    'key': NO_EMPTY_STRING,
                    'label': NO_EMPTY_STRING
                }
            }
        }
    },
    'required': ['type', 'key', 'options']
}

# 'select'
# TODO? add dependency of inputLabel when allowInput == True
RADIO_BUTTON_FIELD_SCHEMA = {
    'type': 'object',
    'properties': {
        'key': NO_EMPTY_STRING,
        'type': {'type': 'string', 'enum': ['radio']},
        'options': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
                    'label': NO_EMPTY_STRING,
                    'value': {'type': ['string', 'number', 'boolean']},
                    'allowText': {'type': 'boolean'}
                }
            }
        },
        'inputLabel': {'type': 'string'},
    },
    'required': ['type', 'key', 'options']
}

# 'select'
# TODO? add placeholder
SELECT_FIELD_SCHEMA = {
    'type': 'object',
    'properties': {
        'type': {'type': 'string', 'enum': ['select']},
        'key': NO_EMPTY_STRING,
        'options': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
                    'label': NO_EMPTY_STRING,
                    'value': {'type': ['string', 'number', 'boolean']},
                }
            }
        }
    },
    'required': ['type', 'key', 'label', 'options']
}

# table
TABLE_FIELD_SCHEMA = {
    'type': 'object',
    'properties': {
        'key': NO_EMPTY_STRING,
        'type': {'type': 'string', 'enum': ['table']},
        'columns': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
                    'header': NO_EMPTY_STRING,
                    'type': {'type': 'string', 'enum': ['label', 'text']},
                    'values': {
                        'type': 'array',
                        'items': {'type': 'string'}
                    },
                }
            }
        }
    },
    'required': ['type', 'key', 'columns']
}

FIELDS_SCHEMA = {
    'type': 'array',
    'items': {
        'anyOf': [
            TEXT_FIELD_SCHEMA,
            TEXTAREA_FIELD_SCHEMA,
            CHECKBOX_FIELD_SCHEMA,
            SELECT_FIELD_SCHEMA,
            RADIO_BUTTON_FIELD_SCHEMA,
            TABLE_FIELD_SCHEMA
        ]
    }
}

SECTIONS_SCHEMA = {
    'type': 'array',
    'items': {
        'type': 'object',
        'properties': {
            'title': {'type': 'string'},
            'fields': FIELDS_SCHEMA
        },
        'required': ['title', 'fields']
    }
}

STEPS_SCHEMA = {
    'type': 'array',
    'items': {
        'type': 'object',
        'properties': {
            'title': {'type': 'string'},
            'sections': SECTIONS_SCHEMA
        },
        'required': ['title', 'sections']
    }
}

FORM_SCHEMA = {
    'type': 'object',
    'properties': {
        'title': {'type': 'string'},
        'steps': STEPS_SCHEMA
    },
    'required': ['title', 'steps']
}


def get_default_form():
    return {
        'title': 'no title',
        'steps': []
    }


def get_schema_field_count(schema):
    return sum(
        len(section['fields'])
        for step in schema['steps']
        for section in step['sections']
    )


def get_schema_field_keys(schema):
    return set(
        field['key']
        for step in schema['steps']
        for section in step['sections']
        for field in section['fields']
    )


def validate_answer_for_schema(answer, schema):
    schema_keys = get_schema_field_keys(schema)
    answer_keys = set(answer.keys())
    return answer_keys <= schema_keys
