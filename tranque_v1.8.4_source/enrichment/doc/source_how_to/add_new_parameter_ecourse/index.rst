Add a new parameter to Ecourse
==============================

In this page, we can learn how to add new parameters to the ecourse project. For example: now, we need to calculate the "nota máxima de la escuela".

Adding the files in ecourse

.. code-block:: xml

  # file: escuela/nota-maxima-escuela.yml

  name: Nota máxima escuela

  scope: group
  groups:
  query:
    canonical_name__startswith: curso-

  inputs:
  - "@ecourse-mvp/escuela/curso/nota"

Edit the nota-maxima-escuela.js file and types the lines:

.. code-block:: none

  //escuela/nota-maxima-escuela.js

  const events = await series.query({head: "*.nota"});
  if (events.length > 0) {
    const maxValue = Math.max(...events.map((event) => event.value));
    series.save(maxValue);
  }

Push the new files to the repository:

.. code-block:: none

  $ git add src/ecourse-mvp/escuela/nota-maxima-escuela.js
  $ git add src/ecourse-mvp/escuela/nota-maxima-escuela.yml
  $ git commit src/ecourse-mvp/escuela/nota-maxima-escuela.js src/ecourse-mvp/escuela/nota-maxima-escuela.yml -m "Adding a new parameter to Ecourse: nota-maxima-escuela"
  $ git push
