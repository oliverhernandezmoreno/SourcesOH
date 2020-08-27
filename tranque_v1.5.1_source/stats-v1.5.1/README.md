# tranque-stats

This is a stats-as-a-service repository to serve stats functions as
HTTP endpoints. The goal of the service is to be **stateless**, that
is, it must not share state between requests in a way that alters
perceived behaviour by some client. This allows for *caching* but not
*stateful resource handling*.

Statistical functions provided by the service should be
self-documented *in code*, and should operate on JSON-serialized
inputs provided on the request. Likewise, they should be able to
serialize their responses in JSON format.

## R development

New functions should be added to the `src-r/api.R` file. Each function
should be a (plumber)[https://www.rplumber.io/]-decorated R function.

**Tests** should be added as bash scripts in the `test-r/suites`
folder. Tests are run during the docker build process, so to run them,
simply do:

```bash
docker build -t test -f docker/Dockerfile.R .
```

from the base folder. The first few steps of the process are costly
but once cached, the actual testing procedure should be very fast,
even after changes in either `src-r/api.R` or any test file within
`test-r/suites`.

## Python development

New functions should be added to the `src/blueprints` package. Each
function is actually a [Flask
Blueprint](http://flask.pocoo.org/docs/1.0/tutorial/views/) and must
be named `bp` within an `endpoints` module a specific package nested
within the `blueprints` package.

Application settings should be read from the environment and declared
in `src/settings.py`. To access a setting (say, `SOME_SETTING`) from
within a request, use the idiom:

```python
from flask import Blueprint, current_app, jsonify

bp = Blueprint("somename", __name__)

# ...

@bp.route("/something")
def something():
    some_setting = current_app.config["SOME_SETTING"]
    # ...
    return jsonify(foo="bar")
```

**Tests** should be added within the
`src/blueprints/<function>/tests.py` module. To run tests, just run
`pytest` from the root folder. Base your test code in
`src/blueprints/health/tests.py` which performs a basic response
status code verification.

**Style** (and testing) is configured in `tox.ini`. To check coding
style, use `flake8` from the root folder.

**To run the server locally** simply run `python src/manage.py run` from the
root folder.
