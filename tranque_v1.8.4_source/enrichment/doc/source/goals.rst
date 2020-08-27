.. _goals:

Objetivos
=========

Objetivo general
----------------

Proveer un entorno para el **cálculo genérico, modular y auditable**
de derivaciones a partir de series de tiempo.

Objetivos específicos
---------------------

1. Proveer un **mecanismo de declaración de modelos teóricos** de
   cómputo de índices que operen sobre series de tiempo.
2. Proveer un **mecanismo de ejecución** de procedimientos complejos y
   de múltiples etapas, que resulten en valores significativos.
3. Permitir que las **implementaciones** de los modelos teóricos sean
   lo **suficientemente flexibles** para poder adaptarse a distintos
   dominios.

Glosario
--------

.. glossary::

   Serie de tiempo
     En la plataforma, es un conjunto de datos numéricos anotados con
     marcas temporales y con un nombre que los identifica como
     pertenecientes a la serie.

   Evento
     Es un valor en una serie de tiempo, con su marca temporal y
     nombre.

   Serie de tiempo cruda
     Es aquella en la que todos sus valores provienen de fuentes
     externas (a la plataforma).

   Serie de tiempo derivada
     Es aquella en la que todos sus valores son generados por la
     ejecución de su procedimiento de cálculo declarado, que puede o
     no usar otros valores de otras series de tiempo como entradas.

   Índice
     Es una serie de tiempo derivada significativa, que usualmente
     entrega el resultado final de un modelo teórico.
