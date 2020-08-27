Execute the Enrichment
======================

From this page you can learn how to execute the enrichment project

Clone enrichment and prepare the docker container
#################################################

First, clone the git repository of "Enrichment" and run the following steps:

.. code-block:: none

  $ cd Inria-Chile/tranque
  $ git clone git@gitlab.com:Inria-Chile/tranque/enrichment.git
  $ cd enrichment
  $ docker stop $(docker ps -q)
  $ docker image prune
  WARNING! This will remove all dangling images.
  Are you sure you want to continue? [y/N] y
  $ docker volume prune
  WARNING! This will remove all local volumes not used by at least one container.
  Are you sure you want to continue? [y/N] y
  $ docker system prune
  WARNING! This will remove:
  - all stopped containers
  - all networks not used by at least one container
  - all dangling images
  - all dangling build cache
  Are you sure you want to continue? [y/N] y

These steps permit to have a clear environment for the next executions of tests.

Setup of the enrichment with EF, EMAC and Ecourse
#################################################

.. code-block:: none

  $ cd testcases
  $ ./build.sh path/to/ef.tgz path/to/emac.tgz path/to/ecourse.tgz
  $ git clone git@gitlab.com:Inria-Chile/tranque/index-test-cases.git
  $ cd index-test-cases

Run the case 0: ecourse
#######################

.. code-block:: none

  $  docker-compose exec django ./cases/legacy/case-0/run.sh

.. image:: ../_static/kibana0.png

Run the cases 1 and 5: EMAC
###########################

.. code-block:: none

  $ docker-compose exec django ./cases/legacy/case-1/run.sh
  $ docker-compose exec django ./cases/legacy/case-5/run.sh

.. image:: ../_static/kibana1.png

.. image:: ../_static/kibana5.png

Run the cases 2, 3 and 4: EF
############################

.. code-block:: none

  $ docker-compose exec django ./run-case-2.sh
  $ docker-compose exec django ./run-case-3.sh
  $ docker-compose exec django ./run-case-4.sh

.. image:: ../_static/kibana2.png

.. image:: ../_static/kibana3.png

.. image:: ../_static/kibana4.png
