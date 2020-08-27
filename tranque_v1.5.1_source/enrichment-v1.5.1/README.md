tranque-enrichment
==================

![quality gate](https://sonar.dev.inria.cl/api/project_badges/measure?project=tranque-enrichment&metric=alert_status)
![bugs](https://sonar.dev.inria.cl/api/project_badges/measure?project=tranque-enrichment&metric=bugs)
![vulnerabilities](https://sonar.dev.inria.cl/api/project_badges/measure?project=tranque-enrichment&metric=vulnerabilities)
![duplications](https://sonar.dev.inria.cl/api/project_badges/measure?project=tranque-enrichment&metric=duplicated_lines_density)

Tranque enrichment is the host for custom implementations of index
computation modules (i.e. javascript functions), triggered after the
reception of messages from an AMQP queue / exchange.

Instalation
-----------

Have [yarn](https://yarnpkg.com/en/docs/install) installed, and then:

```bash
yarn install
```

The command `yarn start info` will print configuration values and
exit.

Implementation host
-------------------

By itself, this application simply consumes messages from the
specified queue and exchange, dispatching them for processing to
unknown handlers. To install handlers, simply point the
`IMPLEMENTATION_BASE` environment variable to the parent folder of all
the handlers. To correctly receive a message, a handler must be a
folder inside the specified base folder, containing at least an
`index.js` file.

The imported module (`<folder>/index.js`) must export a function named
`handler`, which should accept two arguments:

- An object of any shape, the message contents.
- An object with injected dependencies. This contains prepared modules
  to be used by the handler (e.g. elasticsearch connections, logging
  facilities, configuration constants, etc.).

In a docker environment, the handlers could be installed through
shared volumes inside the base folder.

A not-enforced requirement of the handler volumes is the ability to
include their own versioning metadata in the injected timeseries in
the elasticsearch index. At the very least, provide the commit's sha1
in an appropriately-named label.
