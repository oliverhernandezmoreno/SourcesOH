tranque-fake-beats
==================

Tranque fake-beats lifts a daemon that constantly generates random
values and deposits them --wrapped in "atom" envelopes-- in a redis
list. Ideally, said values would be consumed by the event aggregator.

To configure the behaviour of the daemon, set the `FAKING_BEHAVIOUR`
environment variable. It's value should be a JSON-encoded string (or a
path to a YAML-or-JSON-encoded file, or a glob pattern that matches
many such files) that follows the (informal) schema `[<behaviour>]`:

```
<distribution>: {
  "name": <string>,
  ... (distribution-dependent parameters)
}

<random>: {
  "distribution": <distribution>,
  "factor": <number> | undefined,
  "shift": <number> | undefined,
  "fitMin": <number> | undefined,
  "fitMax": <number> | undefined
}

<behaviour>: {
  "timeseries": <string>,
  "interval": <random>,
  "burst": {
    "quantity": <random>,
    "interval": <random>,
    "p": <number> | undefined,
  } | undefined,
  "value": <random>,
  "timestampOffset": <random> | undefined,
  "metadata": [{
    "key": <string>,
    "value": <string>
  }] | undefined
}
```

Distributions, as well as the actual schema, can be found in
`lib/behaviour.ts`.

The `interval`, `burst.quantity` and `burst.interval` random values
are strictly fitted to *[1, +inf)* and rounded to whole numbers. The
`interval` and `burst.interval` are used as milliseconds (arguments to
`setTimeout()`).

A *burst* may be non-deterministic by assigning a value of `burst.p`
(the chance for a burst to happen) to be within *(0, 1)*. By default,
`burst.p` is `1` when bursts are declared, and `0` when bursts aren't
declared.

The `timestampOffset` random value can be used to shift the generated
timestamps by random Values. A positive shift moves the timestamp
forward in time, and a negative shift moves it backwards. The values
represent milliseconds.
