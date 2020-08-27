tranque-sql-beats-producer
==========================

Tranque sql-beats-producer is a program that runs forever and polls a
database, forwarding the received data to an HTTP(S) endpoint.

Usage
-----

The database connection is configured through the `DATABASE_TYPE` and
`DB_*` environment variables. The first one must be one of the
accepted database types, and all the rest are connector specific
(usually `DB_PORT`, `DB_USER`, etc.).

The scripts to execute must be placed in `*.sql` files in a folder,
and the `QUERIES_FOLDER` variable must be set to point to said folder.

Each query must yield results with at least the following columns:
- _name_ a string with the full canonical name of the time series
  (e.g. <target>.<hardware-id>.<series-name>).
- _value_ a numeric value with the measurement's value.
- _timestamp_ a date or datetime field with the measurement's instant.

The `CONSUMER_ENDPOINT` variable must be set to be the consumer
endpoint (e.g. https://dev.tranque.inria.cl/beats/). The
`CONSUMER_PASSWORD` variable must be set with the required password
demanded by the endpoint.

Finally, the `POLL_INTERVAL` variable must be set with the number of
seconds to wait between each polling cycle. By default, this variable
is set to `300` or 5 minutes.
