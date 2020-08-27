# Local stack for frontend/backend development

## Initial setup

```bash
# clone this repo
git clone git@gitlab.com:Inria-Chile/tranque/stack-dev-local.git tranque
cd tranque
# clone frontend and backend
git clone git@gitlab.com:Inria-Chile/tranque/e700-frontend.git frontend
git clone git@gitlab.com:Inria-Chile/tranque/backend.git backend
# login to gitlab registry
docker login registry.gitlab.com
# pull :dev docker images
docker-compose -f docker-compose.yml -f docker-compose.archivist.yml pull
# pull backend computing profiles
./backend/scripts/pull-profiles.sh
# build frontend and backend docker images
docker-compose build
# backend image build will install python dependencies
#  any new backend library dependency has to be added to the requirements.txt file and then rebuild the image with `docker-compose build backend`
# frontend image build install no dependencies, they have to be manually installed
#  using yarn install for new packages inside the frontend project will make them immediately available inside docker image
# install frontend library dependencies
docker-compose run --rm frontend yarn install
# load backup
# Backup files: https://drive.google.com/drive/u/0/folders/1p92WQUeuJslO0woAdu7nExR71lRNzMCQ
# copy <backup_file>.tgz to backups folder
cp <backup_file>.tgz backup-storage/backups_bucket/dev.local/
# check that file is available to restore running
docker-compose -f docker-compose.yml -f docker-compose.archivist.yml run --rm archivist archivist list
# restore backup with
docker-compose -f docker-compose.yml -f docker-compose.archivist.yml run --rm archivist archivist restore <backup_file>.tgz
```

## How to use

```bash
# start stack with
docker-compose up -d
# wait for a moment
# then go to 'localhost' to access frontend site
# or go to 'localhost/api/docs' to access backend docs
# or go to 'localhost/admin' to access backend admin site
# while the stack is running, any changes in the frontend or backend files will trigger the autoreload of the respective dev server
# Welcome to tranque :D
```

### Run backend tests

```bash
docker-compose run --rm backend ./manage.py test -v 2
```

### Custom run backend tests

How to run specific tests in Django for backend you can specify particular tests
to run by supplying any number of “test labels” to ./manage.py test. Each test
label can be a full Python dotted path to a package, module, TestCase subclass,
or test method. For instance:

## Backend tests (api) can be run with:

```bash
docker-compose run --rm backend ./manage.py test package -v verbosity
docker-compose run --rm backend ./manage.py test package.module -v verbosity
docker-compose run --rm backend ./manage.py test package.module.test-case-sublass -v verbosity
docker-compose run --rm backend ./manage.py test package.module.test-case-sublass.test_method -v verbosity
```

## Verbosity

```bash
-v/--verbosity: choose from 0, 1, 2, 3
```

0: Minimal output
1: Normal output
2: Verbose output
3: Very verbose output

## Excecutions by speed:

```bash
# backend tests (Version Slow) can be run with
docker-compose run --rm backend ./manage.py test -v 2
# backend tests (Version Fast) can be run with
docker-compose run --rm backend ./manage.py test --exclude-tag=slow -v 2
```

### Run frontend tests one-shot

Frontend tests can be run as a one-shot run with

```bash
docker-compose run --rm -e CI=1 frontend yarn test
```

### Run frontend tests during development

Frontend tests can be left running during development through

```bash
docker-compose run --rm frontend yarn test
```

### Run frontend tests CDD with Storybook and StyleGuide

CDD tests can be run as a one-shot run with

```bash
# You can now view your Storybook in the browser.
# Copy the second URL and paste in the browser
docker-compose run --rm frontend npm run storybook
# You can now view your StyleGuide in the browser.
#Copy the second URL and paste in the browser
cd frontend
npx styleguidist server
```

### Run linters

```bash
# backend linting is done through flake8
docker-compose run --rm backend flake8
# frontend linting is done through eslint, through a yarn command
docker-compose run --rm frontend yarn lint
```

### Take snapshots

```bash
# make a backup with
docker-compose -f docker-compose.yml -f docker-compose.archivist.yml run --rm archivist archivist backup
# the generated snapshot file will be available at backup-storage/backups_bucket/dev.local/
# if you consider it interesting for development or testing purposes, you may leave it at
# https://drive.google.com/drive/u/0/folders/1p92WQUeuJslO0woAdu7nExR71lRNzMCQ
# with a proper description
```

### Update Migrations

```bash
# backend showmigrations can be run with
docker-compose run --rm backend ./manage.py showmigrations
# backend migrate can be run with
docker-compose run --rm backend ./manage.py migrate
# backend createtargetgroups can be run with
docker-compose run --rm backend ./manage.py createtargetgroups [target] -v 1
```


## Troubleshooting

### backend and frontend directories are not visible in your Atom Editor:

Two posible workarounds:

1. Adjust the settings of Atom
    1. Launch Atom
    1. Open the Edit > Preferences View
    1. Click the Packages tab
    1. Search for “tree view”
    1. Click the Settings button on the tree-view package card
    1. Uncheck “Hide VCS Ignored Files”
1. Create simbolic links in parent directory
    ```bash
    cd ..
    ln -s tranque/frontend/ frontend
    ln -s tranque/backend/ backend
    cd tranque
    ```
### WARNING: Found orphan containers (tranque_backup-storage_1):

Prevent the following warning:

```bash
$ docker-compose up -d
WARNING: Found orphan containers (tranque_backup-storage_1) for this project. If you removed or renamed this service in your compose file, you can run this command with the --remove-orphans flag to clean it up.
```

Use with the following parameter:

```bash
# start stack with
docker-compose up -d --remove-orphans
```

## References:

* https://docs.djangoproject.com/en/2.2/topics/testing/overview/
* https://docs.djangoproject.com/en/2.2/topics/testing/tools/#tagging-tests
* http://rt-ci.inria.cl:8080/twiki/bin/view/Sandbox/TranqueMR
