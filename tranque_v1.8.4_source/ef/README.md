tranque-ef
==========

Physical stability computation module for the tranque platform. This
module executes inside the [enrichment
wrapper](https://gitlab.com/Inria-Chile/tranque/enrichment) and is
built through the [index
builder](https://gitlab.com/Inria-Chile/tranque/index-builder).

Structure
---------

![](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/full.svg)

The index is split into two modules: M1 and M2. M1 is *cualitative*
and consists of four forms, or a form with three sections: design
deviations, vulnerability assessment, and trigger events.

Additionally, three forecast series should be filled with weather
forecast information: `lluvia`, `nevazon` and `vientos`.

M2 integrates measurements coming from several different data sources
into complex failure scenarios.

-------------------------------------------------------------------------------
Release 1.0.0
-------------------------------------------------------------------------------
PENDING EVENTS TO TEST WITH JEST:
* Turbiedad: C1

PENDING TO IMPLEMENT:
* ef-mvp.m2.parameters.revancha-operacional, derivatives and dependencies
* ef-mvp.m2.parameters.revancha-hidraulica, derivatives and dependencies
