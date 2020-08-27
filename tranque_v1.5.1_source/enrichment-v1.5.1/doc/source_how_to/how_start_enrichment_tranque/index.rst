How to start Enrichment in Tranque
==================================

This page describes the way to start the enrichment for Tranque

.. image:: ../_static/applytargetmanifest.png

This script applies the index represented by the given manifest to the given target. Options are: target (The target's canonical name. For example: illapel) and the manifest (The index manifest. For example: ecourse).

.. code-block:: none

  ./manage.py applytargetmanifest illapel ecourse
  ecourse/build/ecourse.manifest

.. code-block:: xml

  {
  "name": "ecourse",
  "version": "ecourse:local",
  "groups": [
    {
      "name": "Curso Estudiante",
      "canonical_name": "curso_estudiante"
    }
  ],
  "metagroups": [
    {
      "canonical_name__startswith": "curso-"
    },
    {
      "canonical_name__startswith": "estudiante-"
    }
  ],
  "inputs": [
    "ecourse-mvp.escuela.curso.nota"
  ],
  "entrypoints": [
    "ecourse-mvp.escuela"
  ]
  }

.. code-block: none

  enrichment/testcases/docker-images/backend/cases/setup-case-0.yml

  target: illapel

  groups:
  - name: Curso Estudiante
    canonical_name: curso_estudiante

  - name: Curso Matematica
    canonical_name: curso-matematica
  - name: Curso Lenguaje
    canonical_name: curso-lenguaje
  - name: Curso Fisica
    canonical_name: curso-electivo_fisica

  - name: Juan
    canonical_name: estudiante-juan
  - name: Luis
    canonical_name: estudiante-luis
  - name: Pedro
    canonical_name: estudiante-pedro
  - name: Diego
    canonical_name: estudiante-diego

  sources:
  - hardware_id: juan-matematica
    name: Estudiante 1 en Matematica
    canonical_name: juan-matematica
    groups:
      - curso_estudiante
      - curso-matematica
      - estudiante-juan
  - hardware_id: juan-lenguaje
    name: Estudiante 1 en Lenguaje
    canonical_name: juan-lenguaje
    groups:
      - curso_estudiante
      - curso-lenguaje
      - estudiante-juan
  - hardware_id: luis-matematica
    name: Estudiante 2 en Matematica
    canonical_name: luis-matematica
    groups:
      - curso_estudiante
      - curso-matematica
      - estudiante-luis
  - hardware_id: luis-lenguaje
    name: Estudiante 2 en Lenguaje
    canonical_name: luis-lenguaje
    groups:
      - curso_estudiante
      - curso-lenguaje
      - estudiante-luis
  - hardware_id: pedro-matematica
    name: Estudiante 2 en Matematica
    canonical_name: pedro-matematica
    groups:
      - curso_estudiante
      - curso-matematica
      - estudiante-pedro
  - hardware_id: pedro-lenguaje
    name: Estudiante 3 en Lenguaje
    canonical_name: pedro-lenguaje
    groups:
      - curso_estudiante
      - curso-lenguaje
      - estudiante-pedro
  - hardware_id: diego-matematica
    name: Estudiante 3 en Matematica
    canonical_name: diego-matematica
    groups:
      - curso_estudiante
      - curso-matematica
      - estudiante-diego
  - hardware_id: diego-lenguaje
    name: Estudiante 3 en Lenguaje
    canonical_name: diego-lenguaje
    groups:
      - curso_estudiante
      - curso-lenguaje
      - estudiante-diego
  - hardware_id: diego-electivo_fisica
    name: Estudiante 3 en Lenguaje
    canonical_name: diego-electivo_fisica
    groups:
      - curso_estudiante
      - curso-electivo_fisica
      - estudiante-diego
