tranque-emac
============

Surrounding-water stability index computation module for the tranque
platform. This module executes inside the [enrichment
wrapper](https://gitlab.com/Inria-Chile/tranque/enrichment) and is
built through the [index
builder](https://gitlab.com/Inria-Chile/tranque/index-builder).

Structure
---------

![](https://gitlab.com/Inria-Chile/tranque/emac/raw/master/graphs/full.svg)

The index consists of three integrating time series, each measuring
water affectation in different ways: IR, II and ADT.

IR measures *risk* of using water for different purposes.

II is a measure of the deposit's influence in the various variables
being measured.
