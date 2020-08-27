Release 1.0.0 - EF - M2
=======================

# Notation

- Blue: Scopre group
- Orange: Scope spread
- Grey: Scope global at tranque

- i: Items in the group
- p: Parents of the group

## Potencial de Rebalse

![potencial-rebalse](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/potencial-rebalse.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
al potencial de rebalse.

- **Lluvia medida** (milímetros por hora): `ef-mvp.m2.parameters.lluvia`
- **Pronóstico de lluvia**:
  - **Duración pronosticada**: (horas pronosticadas): `ef-mvp.m2.parameters.variables.pronostico-tiempo-lluvia`
  - **Volumen total pronosticado** (milímetros totales): `ef-mvp.m2.parameters.variables.pronostico-cantidad-lluvia`
- **Cotas topográficas**:
  - **De laguna**: `ef-mvp.m2.parameters.variables.cota-laguna`
  - **De coronamiento**: `ef-mvp.m2.parameters.altura-muro` (por perfil, se considera el menor de ellos)
  - **De lamas**: `ef-mvp.m2.parameters.variables.cota-lamas` (por perfil, se considera el menor de ellos)

### Parámetros de configuración necesarios

Estos parámetros (accesibles a través de la [API de
parámetros](https://dev.observatorioderelaves.cl/api/docs/v1/#target-parameter-read))
son usados por el potencial de rebalse para completar los cálculos.

- **Curva de embalse**: es una _curva_ discretizada con las
  estimaciones de volumen embalsado de lamas y aguas dada una cota de
  coronamiento:
  - `curve`: lista de puntos de la curva.
  - `curve[].cotaCoronamiento`: [m.s.n.m.] es la cota de coronamiento
    del punto de la curva.
  - `curve[].volumen`: [Mm³] (millones de metros cúbicos) es la
    cantidad de lamas y agua para el punto de la curva.

- **Curva de capacidad de volumen disponible**: es una _curva_
  discretizada con las estimaciones de volumen máximo de contención de
  un depósito dada una cota de coronamiento:
  - `curve`: lista de puntos de la curva.
  - `curve[].cotaCoronamiento`: [m.s.n.m.] es la cota de coronamiento
    del punto de la curva.
  - `curve[].volumen`: [Mm³] (millones de metros cúbicos) es el
    volumen máximo teórico disponible para una cota de coronamiento
    específico.

- **Área de la cubeta**: es el área total de la cubeta, incluídas los
  coeficientes opcionales Cr y P':
  - `area`: [m²] superficie de la cubeta
  - `cr`: coeficiente Cr
  - `p`: coeficiente P'

- **Área aportante directa a la cubeta**: es el área total circundante
  a la cubeta cuyo escurrimiento de agua no está cubierto por canales
  perimetrales:
  - `area`: [m²] superficie total
  - `cr`: coeficiente Cr
  - `p`: coeficiente P'

- **Áreas aportantes**: es una lista de áreas aportantes al depósito
  cuyo escurrimiento de agua si está cubierto por canales perimetrales
  y/o embalses.
  - `[].code`: (string) el identificador del área aportante
  - `[].area`: [m²] superficie total
  - `[].cr`: coeficiente Cr
  - `[].p`: coeficiente P'

- **Vertederos de emergencia**: es una lista de los vertederos que
  evacúan agua de la cubeta cuando el nivel de ésta alcanza una cota
  específica:
  - `[].code`: (string) el identificador del vertedero.
  - `[].capacidadDesvio`: [m³/h] es el caudal que es capaz de desviar
    el vertedero.
  - `[].cotaInicioFuncionamiento`: [m.s.n.m.] es la cota de agua a la
    que el vertedero comienza a operar.

- **Canales perimetrales**: es la lista de canales que rodean al
  depósito y que desvían el agua que escurre por las áreas aportantes.
  - `[].code`: (string) el identificador del canal perimetral.
  - `[].desvio`: [m³/h] es la capacidad de desvío del canal perimetral.
  - `[].areaCode`: (string) es el área aportante asociada al canal
    perimetral.
  - `[].desvioConexion`: es la conexión del canal perimetral con un
    embalse o con el exterior. Puede ser una de dos opciones:
    - `[].desvioConexion.embalseCode`: el código de un _embalse_.
    - `[].desvioConexion.exterior`: la constante `true`, representando
      un desvío hacia el exterior de la cuenca.

- **Embalses**: lista de estanques que acumulan agua que escurre hacia
  el depósito:
  - `[].code`: (string) el identificador del embalse.
  - `[].capacidad`: [m³] el volumen de agua que puede contener el
    embalse.
  - `[].areaCode`: (string) el código de área aportante asociado al
    embalse.
  - `[].descargaCanalCode`: (string) el código de canal perimetral al
    que descarga este embalse.

### Variables intermedias de interés

Estas variables son cálculos intermedios de potencial de rebalse, que
tienen utilidad para un usuario final en la comprensión de un problema
evidenciado en un evento de potencial de rebalse.

- **Volumen disponible**: el volumen teórico disponible para alojar
  agua en el depósito, a partir de la cota de coronamiento y las
  curvas de embalse y de capacidad disponible. La variable es
  `ef-mvp.m2.parameters.variables.volumen-disponible`.

- **Estado y tiempo de lluvia real**: es la condición de lluvia
  (sí/no) y el tiempo total transcurrido de lluvia continua (en caso
  de que el estado de lluvia sea "sí"). Las variables son
  `ef-mvp.m2.parameters.variables.estado-lluvia` y
  `ef-mvp.m2.parameters.variables.tiempo-lloviendo` respectivamente.

- **Lluvia acumulada**: es la cantidad total de milímetros caídos
  desde el inicio de la lluvia. La variable es
  `ef-mvp.m2.parameters.lluvia.acumulada`.

- **Potencial de rebalse**: es una medida de probabilidad de que se
  produzca un fallo por rebalse. Es un parámetro crítico según la
  especificación de AMTC. La variable es
  `ef-mvp.m2.parameters.potencial-rebalse`.

- **Tiempo de rebalse**: es el tiempo teórico en horas que debe
  transcurrir bajo las condiciones actuales de lluvia para que se
  produzca el fallo por rebalse. La variable es
  `ef-mvp.m2.parameters.potencial-rebalse.tiempo-rebalse`.

- **Potencial de rebalse precalculado**: es un potencial de rebalse
  calculado únicamente en base al pronóstico de lluvia, y no en base a
  mediciones reales de lluvia. La variable es
  `ef-mvp.m2.parameters.potencial-rebalse.precalculo`.

- **Tiempo de rebalse precalculado**: es el tiempo de rebalse
  calculado únicamente en base al pronóstico de lluvia, y no en base a
  mediciones reales de lluvia. La variable es
  `ef-mvp.m2.parameters.potencial-rebalse.precalculo.tiempo-rebalse`.

### Eventos

De Potencial de rebalse:
- **A1** está determinado directamente por la variable `ef-mvp.m1.triggers.canales-perimetrales`.
- **A2** está determinado directamente por la variable `ef-mvp.m2.parameters.potencial-rebalse.A2`
- **A3** está determinado directamente por la variable `ef-mvp.m2.parameters.potencial-rebalse.A3`
- **B1** está determinado directamente por la variable `ef-mvp.m1.triggers.forecasts.lluvia`
- **B2** está determinado directamente por la variable `ef-mvp.m1.triggers.important.lluvia`
- **B3** está determinado directamente por la variable `ef-mvp.m2.parameters.potencial-rebalse.B3`
- **B4** está determinado directamente por la variable `ef-mvp.m2.parameters.potencial-rebalse.B4`

De Lluvia:
- **B1** está determinado directamente por la variable `ef-mvp.m2.parameters.lluvia.B1`

## Altura de Coronamiento o Altura de Muro (Topografia):

![grafo-altura-coronamiento](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/altura-muro.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
a la altura de coronamiento (topografia).

- **Altura de coronamiento** (Metros sobre el nivel del mar): `ef-mvp.m2.parameters.altura-muro`

### Eventos

De Altura-muro:
- **A1** está determinado directamente por la variable `ef-mvp.m2.parameters.altura-muro` y `ef-mvp.m2.parameters.altura-muro/proyectada`.
- **A2** está determinado directamente por la variable `ef-mvp/m2/parameters/altura-muro` y `ef-mvp.m2.parameters.altura-muro/proyectada`.

## Ancho de Coronamiento (Topografia):

![grafo-ancho-coronamiento](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/ancho-coronamiento.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
al ancho de coronamiento (topografia).

- **Distancia de Laguna** (Metro): `ef-mvp.m2.parameters.distancia-laguna`

### Eventos

De Ancho-coronamiento:
- **A2** está determinado directamente por la variable `ef-mvp/m2/parameters/ancho-coronamiento`.
- **B1** está determinado directamente por la variable `ef-mvp/m2/parameters/ancho-coronamiento`.

## Distancia de Laguna (Topografia):

![grafo-distancia-laguna](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/distancia-laguna.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
al distancia de laguna (topografia).

- **Distancia de Laguna** (Metros): `ef-mvp.m2.parameters.distancia-laguna`

### Eventos

De Distancia de Laguna:
- **A1** está determinado directamente por la variable `ef-mvp/m2/parameters/distancia-laguna`.
- **B2** está determinado directamente por la variable `ef-mvp/m2/parameters/distancia-laguna`.
- **C1** está determinado directamente por la variable `ef-mvp/m2/parameters/distancia-laguna`.

## Pendiente de Muro (Topografia):

![grafo-pendiente-muro](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/pendiente-muro.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
a la pendiente de muro (topografia).

- **Pendiente de muro** (Porcentaje): `ef-mvp.m2.parameters.pendiente-muro`

### Eventos

De Pendiente de Muro:
- **A2** está determinado directamente por la variable `ef-mvp/m2/parameters/pendiente-muro/local-aguas-abajo`.
- **A3** está determinado directamente por la variable `ef-mvp/m2/parameters/pendiente-muro/local-aguas-arriba`.
- **B1** está determinado directamente por la variable `ef-mvp/m2/parameters/pendiente-muro/global-aguas-abajo`.
- **B2** está determinado directamente por la variable `ef-mvp/m2/parameters/pendiente-muro/global-aguas-arriba`.
- **B3** está determinado directamente por la variable `ef-mvp/m2/parameters/pendiente-muro/global-aguas-abajo`.
- **B4** está determinado directamente por la variable `ef-mvp/m2/parameters/pendiente-muro/global-aguas-arriba`.

## Pendiente de Playa (Topografia):

![grafo-pendiente-playa](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/pendiente-playa.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
a la pendiente de playa (topografia).

- **Pendiente de playa** (Porcentaje): `ef-mvp.m2.parameters.pendiente-playa`

### Eventos

De Pendiente de playa:
- **B1** está determinado directamente por la variable `ef-mvp/m2/parameters/pendiente-playa`.
- **B2** está determinado directamente por la variable `ef-mvp/m2/parameters/pendiente-playa`.

## Revancha Hidraulica (Topografia):

![revancha-hidraulica](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/revancha-hidraulica.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
a la revancha hidraulica (topografia).

- **Revancha hidraulica** (Porcentaje): `ef-mvp.m2.parameters.revancha-hidraulica`

### Eventos

De Revancha Hidraulica:
- **A1** está determinado directamente por la variable `ef-mvp/m2/parameters/pendiente-playa`.
- **B1** está determinado directamente por la variable `ef-mvp/m2/parameters/pendiente-playa`.
- **B2** está determinado directamente por la variable `ef-mvp/m2/parameters/pendiente-playa`.
- **B3** está determinado directamente por la variable `ef-mvp/m2/parameters/pendiente-playa`.

## Revancha Operacional (Topografia):

![revancha-operacional](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/revancha-operacional.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
a la revancha operacional (topografia).

- **Revancha operacional** (Porcentaje): `ef-mvp.m2.parameters.revancha-operacional`

### Eventos

De Revancha operacional:
- **A2** está determinado directamente por la variable `ef-mvp/m2/parameters/revancha-operacional`.
- **B1** está determinado directamente por la variable `ef-mvp/m2/parameters/revancha-operacional`.
- **B2** está determinado directamente por la variable `ef-mvp/m2/parameters/revancha-operacional`.
- **B3** está determinado directamente por la variable `ef-mvp/m2/parameters/revancha-operacional`.
- **C1** está determinado directamente por la variable `ef-mvp/m2/parameters/revancha-operacional`.

## Nivel freatico cubeta deposito (Presion de Poros):

![nivel-freatico-cubeta-deposito](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/nivel-freatico-cubeta-deposito.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
a la presion de poros (topografia).

- **Nivel freatico cubeta deposito** (Nivel freatico cubeta deposito): `ef-mvp.m2.parameters.nivel-freatico-cubeta-deposito`

### Eventos

De Nivel freatico cubeta deposito:
- **A1** está determinado directamente por la variable `ef-mvp/m2/parameters/nivel-freatico-cubeta-deposito`.
- **B1** está determinado directamente por la variable `ef-mvp/m2/parameters/nivel-freatico-cubeta-deposito/maxima-sector`.

## Integridad Sistema Drenaje (Caudalimetro):

![integridad-sistema-drenaje](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/integridad-sistema-drenaje.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
a la integridad sistema drenaje (caudalimetro).

- **Integridad sistema drenaje** (L/S Caudal): `ef-mvp.m2.parameters.integridad-sistema-drenaje`

### Eventos

De Integridad-sistema-drenaje:
- **B1** está determinado directamente por la variable `ef-mvp/m2/parameters/integridad-sistema-drenaje/falla-sistema-drenaje`.
- **B2** está determinado directamente por la variable `ef-mvp/m2/parameters/caudal`.
- **B3** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/maxima-sector`.
- **C1-1** está determinado directamente por la variable `@ef-mvp/m2/parameters/integridad-sistema-drenaje/validacion-manual` y `@ef-mvp/m2/parameters/integridad-sistema-drenaje/superacion-umbral`.
- **C1-2** está determinado directamente por la variable `ef-mvp/m2/parameters/integridad-sistema-drenaje/validacion-manual` y `ef-mvp/m2/parameters/integridad-sistema-drenaje/superacion-umbral`.
- **C1** está determinado directamente por la variable `ef-mvp/m2/parameters/integridad-sistema-drenaje/presion-poros-validacion-manual` y `ef-mvp/m2/parameters/integridad-sistema-drenaje/maxima-dren`.
- **C2** está determinado directamente por la variable `ef-mvp/m2/parameters/integridad-sistema-drenaje/presion-poros-validacion-manual` y
`ef-mvp/m2/parameters/integridad-sistema-drenaje/maxima-dren`.

## Turbiedad (Turbidimetro):

![turbiedad](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/turbiedad.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
a la turbiedad (turbidimetro).

- **Turbiedad** (Unidad nefelométrica de turbidez): `ef-mvp.m2.parameters.turbiedad`

### Eventos

De Turbiedad:
- **B1** está determinado directamente por la variable `ef-mvp/m1/triggers/turbiedad`.
- **B2** está determinado directamente por la variable `ef-mvp/m2/parameters/turbiedad/maxima-turbiedad`.
- **B3-1** está determinado directamente por la variable `ef-mvp/m1/triggers/turbiedad` `ef-mvp/m2/parameters/turbiedad` `ef-mvp/m2/parameters/turbiedad/maxima-turbiedad`.
- **C1** está determinado directamente por la variable `ef-mvp/m2/parameters/turbiedad/B3-1`.

## Tonelaje:

![tonelaje](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/tonelaje.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
a la tonelaje (tonelaje).

- **Tonelaje** (M3): `ef-mvp.m2.parameters.tonelaje`

### Eventos

De Tonelaje:
- **A1** está determinado directamente por la variable `ef-mvp/m2/parameters/tonelaje` y `ef-mvp/m2/parameters/volumen-relave`.
- **A2** está determinado directamente por la variable `ef-mvp/m2/parameters/tonelaje` y `ef-mvp/m2/parameters/volumen-relave`.
- **B1** está determinado directamente por la variable `ef-mvp/m2/parameters/tonelaje/maxima-medida-tonelaje`.

## Integridad Externa:

![integridad-externa](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/integridad-externa.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
a integridad externa.

- **Integridad Externa**: `ef-mvp.m2.parameters.integridad-externa`

### Eventos

De Integridad-Externa (Estribos):
- **B1** está determinado directamente por la variable `ef-mvp/m1/triggers/estribo`.
- **B2** está determinado directamente por la variable `ef-mvp/m2/parameters/integridad-externa/estribos/tendencia-activacion-manual`.
- **C1** está determinado directamente por la variable `ef-mvp/m2/parameters/discrete/inputs/estribos`.
- **D1** está determinado directamente por la variable `ef-mvp/m2/parameters/integridad-externa/estribos/desplazamiento-activacion-manual`.

De Integridad-Externa (Filtraciones):
- **B1** está determinado directamente por la variable `ef-mvp/m1/triggers/filtraciones`.
- **C1** está determinado directamente por la variable `ef-mvp/m1/triggers/important/terremoto-4-6` y `ef-mvp/m2/parameters/discrete/inputs/filtraciones`.
- **C2** está determinado directamente por la variable `ef-mvp/m2/parameters/discrete/inputs/filtraciones` y `ef-mvp/m1/triggers/important/terremoto-4-6`.

De Integridad-Externa (Subsidencia > Cubeta):
- **B2** está determinado directamente por la variable `ef-mvp/m1/triggers/subsidencia-cubeta`.
- **C2** está determinado directamente por la variable `ef-mvp/m2/parameters/discrete/inputs/subsidencia` y `ef-mvp/m1/triggers/subsidencia-cubeta`.

De Integridad-Externa (Subsidencia > Muro):
- **B1** está determinado directamente por la variable `ef-mvp/m1/triggers/subsidencia-muro`.
- **C1** está determinado directamente por la variable `ef-mvp/m2/parameters/discrete/inputs/subsidencia` y `ef-mvp/m1/triggers/subsidencia-muro`.

## Deformacion:

![deformacion](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/deformacion.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
a deformacion.

- **Deformacion**: `ef-mvp.m2.parameters.deformacion`

### Eventos

De Deformacion (Coronamiento > Monolito > Eje-x):
- **B1** está determinado directamente por la variable `ef-mvp/m2/parameters/deformacion/coronamiento/monolito/eje-x/tendencia`.
- **C1** está determinado directamente por la variable `ef-mvp/m2/parameters/deformacion/coronamiento/monolito/eje-x/deformacion-monolito` y `ef-mvp/m2/parameters/deformacion-monolito-eje-x`.

De Deformacion (Coronamiento > Monolito > Eje-y):
- **B2** está determinado directamente por la variable `ef-mvp/m2/parameters/deformacion/coronamiento/monolito/eje-y/tendencia`.
- **C2** está determinado directamente por la variable `ef-mvp/m2/parameters/deformacion/coronamiento/monolito/eje-y/deformacion-monolito` y `ef-mvp/m2/parameters/deformacion-monolito-eje-y`.

De Deformacion (Coronamiento > Monolito > Eje-z):
- **B2** está determinado directamente por la variable `ef-mvp/m2/parameters/deformacion/coronamiento/monolito/eje-z/tendencia`.
- **B3** está determinado directamente por la variable `ef-mvp/m2/parameters/deformacion/coronamiento/monolito/eje-z/deformacion-monolito` y `ef-mvp/m2/parameters/deformacion-monolito-eje-y`.
- **C3** está determinado directamente por la variable `ef-mvp/m2/parameters/deformacion/coronamiento/monolito/eje-z/deformacion-monolito` y `ef-mvp/m2/parameters/deformacion-monolito-eje-z`.

De Deformacion (Muro > Inclinometro > Eje-x):
- **C4** está determinado directamente por la variable `ef-mvp/m2/parameters/deformacion/muro/inclinometro/eje-x/deformacion-inclinometro-z` y `ef-mvp/m2/parameters/deformacion/muro/inclinometro/eje-x/deformacion-inclinometro-z`.

De Deformacion (Muro > Inclinometro > Eje-y):
- **C4** está determinado directamente por la variable `ef-mvp/m2/parameters/deformacion/muro/inclinometro/eje-y/deformacion-inclinometro-z` y `ef-mvp/m2/parameters/deformacion-inclinometro-z-eje-y`.

De Deformacion (Muro > Inclinometro > Eje-z):
- **C6** está determinado directamente por la variable `ef-mvp/m2/parameters/deformacion/muro/inclinometro/eje-z/deformacion-inclinometro-z` y `ef-mvp/m2/parameters/deformacion-inclinometro-z-eje-y`.

De Deformacion (Muro > Monolito > Eje-x):
- **C1** está determinado directamente por la variable `ef-mvp/m2/parameters/deformacion/muro/monolito/eje-x/deformacion-monolito` y `ef-mvp/m2/parameters/deformacion/muro/inclinometro/eje-x/deformacion-inclinometro-z`.

De Deformacion (Muro > Monolito > Eje-y):
- **C2** está determinado directamente por la variable `ef-mvp/m2/parameters/deformacion/muro/monolito/eje-y/deformacion-monolito` y `ef-mvp/m2/parameters/deformacion-monolito-eje-y`.

De Deformacion (Muro > Monolito > Eje-z):
- **C3** está determinado directamente por la variable `ef-mvp/m2/parameters/deformacion/muro/monolito/eje-z/deformacion-monolito` y `ef-mvp/m2/parameters/deformacion-monolito-eje-z`.

## Presion de Poros

![presion-poros](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/presion-poros.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
a presion-poros:

- **Presion-poros**: `ef-mvp.m2.parameters.presion-poros`

### Eventos

- **B1** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/tendencia-sector-umbral1`.
- **B2** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/tendencia-sector-umbral2`.
- **B3** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/tendencia-sector-antes-sismo` y `ef-mvp/m2/parameters/presion-poros/tendencia-sector-despues-sismo`.
- **B4-1** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/maxima-sector`.
- **B4-2** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/maxima-sector`.
- **B5-1** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros`.
- **B5-2** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/superacion-umbral1` y `ef-mvp/m2/parameters/presion-poros/superacion-umbral2`.
- **B5-3** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/superacion-umbral1`.
- **B5-4** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/superacion-umbral2`.
- **B6-1** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/superacion-umbral1` y `ef-mvp/m2/parameters/presion-poros/validacion-manual`.
- **B6-2** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/superacion-umbral1` y `ef-mvp/m2/parameters/presion-poros/validacion-manual`.
- **B6-3** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/superacion-umbral1` y `ef-mvp/m2/parameters/presion-poros/validacion-manual`.
- **C1-1** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/superacion-umbral1` y `ef-mvp/m2/parameters/presion-poros/superacion-umbral2`.
- **C1-2** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/superacion-umbral1`.
- **C1-3** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/superacion-umbral1` y `ef-mvp/m2/parameters/presion-poros/superacion-umbral2`.
- **C1-4** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/superacion-umbral1`.
- **C1-5** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/superacion-umbral1` y `ef-mvp/m2/parameters/presion-poros/superacion-umbral2`.
- **C1-6** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/superacion-umbral1` y `ef-mvp/m2/parameters/presion-poros/superacion-umbral2`.
- **C2-1** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/validacion-manual`, `ef-mvp/m2/parameters/presion-poros/superacion-umbral1` y `ef-mvp/m2/parameters/presion-poros/superacion-umbral2`.
- **C2-2** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/superacion-umbral1` y `ef-mvp/m2/parameters/presion-poros/superacion-umbral2`.
- **D1** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/superacion-umbral2`.
- **D2** está determinado directamente por la variable `ef-mvp/m2/parameters/presion-poros/validacion-manual`.

## Densidad
![densidad](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/densidad.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
a densidad.

- **Densidad**: `ef-mvp.m2.parameters.densidad`

### Eventos

- **B1** está determinado directamente por la variable `ef-mvp/m2/parameters/densidad`.
- **B2** está determinado directamente por la variable `ef-mvp/m2/parameters/densidad/compactacion-activacion-manual`.

## Cumplimiento de las características de diseño del sistema de drenaje
![cumplimiento-diseno-dren](https://gitlab.com/Inria-Chile/tranque/ef/raw/master/graphs/cumplimiento-diseno-dren.svg)

### Variables de entrada

Estas variables representan valores físicos de interés directo para el
usuario, y apuntan directamente a las causas de los eventos asociados
a cumplimiento-diseno-dren.

- **Densidad**: `ef-mvp.m2.parameters.cumplimiento-diseno-dren`

### Eventos

- **A1** está determinado directamente por la variable `ef-mvp/m2/parameters/cumplimiento-diseno-dren/validado`.
- **A2** está determinado directamente por la variable `ef-mvp/m2/parameters/cumplimiento-diseno-dren/informacion-parcial`.
- **B1** está determinado directamente por la variable `ef-mvp/m2/parameters/cumplimiento-diseno-dren/sin-informacion`.

## Pending parameters:

* Turbiedad
```bash
    C1
```
