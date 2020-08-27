tranque-cron
============

Scheduler for API hits for the tranque platform. For each specified
period, a request is issued:

```
POST <api-host>/api/<version>/cron/<interval>
Content-Type: application/json
Authorization: Token <token>

{
  "period": "<interval>",
  "lastTrigger": "<timestamp>",
  "currentTrigger": "<timestamp>"
}
```

The requests can be configured through the following environment variables:

- `BACKEND_SCHEME`, by default `http`.
- `BACKEND_HOST`, by default `localhost`.
- `BACKEND_PORT`, by default `8000`.
- `BACKEND_API_VERSION`, by default `v1`.
- `BACKEND_TOKEN`, without a default value, should be set if the endpoint requires it.

The request intervals (and endpoints) are by default the following:

- `15min`: `*/15 * * * *`
- `hourly`: `0 * * * *`
- `daily`: `0 2 * * *`
- `weekly`: `0 3 * * 6`
- `monthly`: `0 5 1 * *`

Custom intervals can be configured through the
`CRON_ENTRIES` environment variable, that accepts cron entries
separated by the pipe character (`|`). For example: `* * * * *|10,30,50 * * * *`
adds two intervals (every minute, and at minutes 10, 30 and
50), with generic interval names `custom-0` and `custom-1`.

To specify custom endpoints for each interval, prepend the name of
each endpoint to each cron entry. For example: `minute:* * * *
*|often:10,30,50 * * * *` would add schedule two periodic API requests
to the endpoints `minute` (`/api/v1/cron/minute`) and `often`
(`/api/v1/cron/often`).

Specifying `CRON_ENTRIES` **replaces** the default setting of
intervals.
