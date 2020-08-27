tranque-backend
===============

![quality gate](https://sonar.dev.inria.cl/api/project_badges/measure?project=tranque-backend&metric=alert_status)
![loc](https://sonar.dev.inria.cl/api/project_badges/measure?project=tranque-backend&metric=ncloc)
![bugs](https://sonar.dev.inria.cl/api/project_badges/measure?project=tranque-backend&metric=bugs)
![vulnerabilities](https://sonar.dev.inria.cl/api/project_badges/measure?project=tranque-backend&metric=vulnerabilities)
![duplications](https://sonar.dev.inria.cl/api/project_badges/measure?project=tranque-backend&metric=duplicated_lines_density)

Tranque backend is a Django REST API backed by a PostGIS database.

Integrated development stack installation
-----------------------------------------

This repo is better worked on through the [development
stack](https://gitlab.com/Inria-Chile/tranque/stack-dev-local). Follow
the instructions there to install the backend through docker-compose.

(DEPRECATED) Standalone Installation
------------------------------------

First, prepare a virtual environment for python3.6 (don't try 3.7 yet,
pyproj installation will fail). The convention is to name it `env`
inside the repository's folder (it's excluded from version control):

```bash
python3.6 -m venv env
. env/bin/activate
```

Install GDAL and python development headers. On Ubuntu, this should
be:

```bash
sudo apt-get install libgdal-dev python3.6-dev
```

Then, to install all python dependencies (essential and
development-related), use:

```bash
pip install -r requirements.dev.txt
```

To start all required services and initial data, run the
initialization script:

```bash
scripts/run-docker.sh
```

### S3 Storage
By default the configuration is set to store all uploaded files in the
local system storage. To use an S3 service for storage set this
environment variables:
- DEFAULT_FILE_STORAGE=storages.backends.s3boto3.S3Boto3Storage
- AWS_ACCESS_KEY_ID=<access_key>
- AWS_SECRET_ACCESS_KEY=<secret_key>
- AWS_STORAGE_BUCKET_NAME=<bucket_name>
- S3_ENDPOINT_URL=<s3_service_host>

#### Troubleshooting
- If a migration or loading data error occurs, a previous database
state might be conflicting with the current state. Try destroying the
volume and running the initialization script again:

```bash
docker stop $(docker ps -q)  # stop all docker containers
docker volume prune  # destroy all docker volumes (confirm with Y)
scripts/run-docker.sh  # initialize everything from scratch
```

- If you get an error saying:

```
Error response from daemon: Get https://registry.gitlab.com/v2/inria-chile/tranque/ef/manifests/master: denied: access forbidden
```

Then you should autheticate using your Gitlab's user/pass (if you
signed up with Google or other service account, create a password!
Also you could generate an access token in your Gitlab's user
settings).

```
docker login registry.gitlab.com
```

Development guidelines
----------------------

In general, simply follow the structure of the code base. Special
consideration should be given to the following points:

- **All** endpoints should have at least one test which verifies their
  default behaviour.
- **All** endpoints should have at least one test per non-trivial edge
  case. If you have doubts about whether an edge case is trivial or
  not, discuss it with the team.
- Add documentation for endpoints and filters as you're writing them.
- Closely monitor the amount of database queries each endpoint
  generates, so as to avoid *O(n)* (or worse) query counts. This can
  be checked by invoking the specific endpoint with the `queries` GET
  parameter added. (e.g. `GET /api/v1/target/?queries`)

Development tools
-----------------

To graph the database models, first install graphviz. On Ubuntu, this
should be:

```bash
sudo apt-get install graphviz
```

Then, to obtain a file `models.png` with a database diagram, use:

```bash
src/manage.py graph_models -a -o models.png
```

Or any other variation of `graph_models`.
