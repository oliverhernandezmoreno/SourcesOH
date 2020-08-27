tranque-beats-consumer
======================

Tranque beats-consumer is an HTTP middleware to protect the depositing
of events into the redis buffer, through SSL, passwords, and access to
only one redis command.

Example
-------

Request:

```
POST / HTTP/1.1
Authorization: Token aaaabbbbcccc

[{
  "@timestamp": "2018-11-20T15:00:00.000",
  "value": 1.2345,
  "name": "foo.bar"
}, {
  "@timestamp": "2018-11-20T15:00:01.000",
  "value": 5.4321,
  "name": "foo.baz",
  "labels": [{
    "key": "hey",
    "value": "you"
  }, {
    "key": "out there",
    "value": "on the wall"
  }]
}]
```

Response body:

```json
{"count":2,"success":true}
```

Here, two events are forwarded to redis. The authentication performed
is trivial: the given token (`aaaabbbbcccc`) matched one of the
passwords given through the `ACCESS_PASSWORDS` environment variable, a
comma-separated list of alphanumeric strings.
