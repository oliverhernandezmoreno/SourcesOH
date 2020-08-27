# Tranque Frontend

This project was build using [create-react-app](https://facebook.github.io/create-react-app/).

## Deployment

The project is packaged as a docker image. The docker image is an
nginx which serves the built artifacts, and it can be minimally
configured with environment variables prefixed with `OVERRIDE_`. For
example:

```
docker run -e OVERRIDE_API_HOST=https://foobar.com/api this-image
```

would override the default configuration variable for `API_HOST` with
the one given (https://foobar.com/api).

**Important note:**

Environment variables prefixed with `OVERRIDE_` which are set for the
container will be completely exposed to the public consuming this
application, so don't put secret stuff in there.

## URL <-> name map

```
PATH                                                                                           NAME
/                                                                                             => home
/login                                                                                        => login
/e700/                                                                                        => e700
/e700/formulario/:id                                                                          => e700.form
/e700/deposito/:target_canonical_name                                                         => e700.target
/e700/registro                                                                                => e700.registry
/e700/detalle_registro/:id                                                                    => e700.detail
/e700/detalle_caso/:id                                                                        => e700.case
/mineras/                                                                                     => miners
/mineras/                                                                                     => miners.home
/mineras/deposito/:target/                                                                    => miners.target
/mineras/deposito/:target/estabilidad_deposito/                                               => miners.target.ef
/mineras/deposito/:target/estabilidad_deposito/dashboard                                      => miners.target.ef.dashboard
/mineras/deposito/:target/estabilidad_deposito/datos/carga/:executor/                         => miners.target.ef.dataLoad
/mineras/deposito/:target/estabilidad_deposito/datos/carga/:executor/archivo/:operation?      => miners.target.ef.dataLoad.fromFile
/mineras/deposito/:target/estabilidad_deposito/datos/carga/:executor/formulario/:operation?   => miners.target.ef.dataLoad.fromForm
/mineras/deposito/:target/estabilidad_deposito/datos/registros/:executor/                     => miners.target.ef.registry
/mineras/deposito/:target/estabilidad_deposito/datos/registros/:executor/registro-ingresos    => miners.target.ef.registry.operationList
/mineras/deposito/:target/estabilidad_deposito/datos/                                         => miners.target.ef.data
/mineras/deposito/:target/estabilidad_deposito/datos/:template                                => miners.target.ef.data.template
/mineras/deposito/:target/estabilidad_deposito/inspeccion-y-evaluacion/                       => miners.target.ef.inspection-and-evaluation
/mineras/deposito/:target/estabilidad_deposito/inspeccion-y-evaluacion/inspeccion/:executor   => miners.target.ef.inspection-and-evaluation.inspection
/mineras/deposito/:target/estabilidad_deposito/inspeccion-y-evaluacion/evaluacion/:executor   => miners.target.ef.inspection-and-evaluation.evaluation
/mineras/deposito/:target/estabilidad_deposito/inspeccion-y-evaluacion/historico              => miners.target.ef.inspection-and-evaluation.registry
/mineras/deposito/:target/estabilidad_deposito/inspeccion-y-evaluacion/comprobante/:operation => miners.target.ef.inspection-and-evaluation.voucher
/mineras/deposito/:target/aguas_circundantes/                                                 => miners.target.emac
/mineras/deposito/:target/aguas_circundantes/dashboard                                        => miners.target.emac.dashboard
/mineras/deposito/:target/aguas_circundantes/datos/carga/:executor?/:operation?               => miners.target.emac.massLoad
/mineras/deposito/:target/aguas_circundantes/datos/                                           => miners.target.emac.data
/mineras/deposito/:target/aguas_circundantes/datos/registro/                                  => miners.target.emac.data.load
/mineras/deposito/:target/aguas_circundantes/datos/ii/superficial                             => miners.target.emac.data.iiSuperficial
/mineras/deposito/:target/aguas_circundantes/datos/ii/subterraneo                             => miners.target.emac.data.iiSubterranean
/mineras/deposito/:target/aguas_circundantes/datos/ir/superficial/                            => miners.target.emac.data.irSuperficial
/mineras/deposito/:target/aguas_circundantes/datos/ir/superficial/:path                       => miners.target.emac.data.irSuperficial.forUse
/mineras/deposito/:target/aguas_circundantes/datos/ir/superficial/riego                       => miners.target.emac.data.irSuperficial.riego
/mineras/deposito/:target/aguas_circundantes/datos/ir/superficial/agua-potable                => miners.target.emac.data.irSuperficial.aguaPotable
/mineras/deposito/:target/aguas_circundantes/datos/ir/superficial/recreacion                  => miners.target.emac.data.irSuperficial.recreacion
/mineras/deposito/:target/aguas_circundantes/datos/ir/superficial/vida-acuatica               => miners.target.emac.data.irSuperficial.vidaAcuatica
/mineras/deposito/:target/aguas_circundantes/datos/ir/subterraneo/                            => miners.target.emac.data.irSubterranean
/mineras/deposito/:target/aguas_circundantes/datos/ir/subterraneo/:path                       => miners.target.emac.data.irSubterranean.forUse
/mineras/deposito/:target/aguas_circundantes/datos/ir/subterraneo/riego                       => miners.target.emac.data.irSubterranean.riego
/mineras/deposito/:target/aguas_circundantes/datos/ir/subterraneo/agua-potable                => miners.target.emac.data.irSubterranean.aguaPotable
/mineras/deposito/:target/aguas_circundantes/datos/ir/subterraneo/recreacion                  => miners.target.emac.data.irSubterranean.recreacion
/mineras/deposito/:target/aguas_circundantes/datos/ir/subterraneo/vida-acuatica               => miners.target.emac.data.irSubterranean.vidaAcuatica
/mineras/deposito/:target/aguas_circundantes/datos/ir/:waterType/:indexType                   => miners.target.emac.data.ir
/mineras/deposito/:target/aguas_circundantes/datos/ir/:waterType/:indexType/:templateCN       => miners.target.emac.data.ir.detail
/mineras/deposito/:target/aguas_circundantes/datos/en-bruto/                                  => miners.target.emac.data.raw
/mineras/deposito/:target/aguas_circundantes/datos/en-bruto/por-variable                      => miners.target.emac.data.raw.byVariable
/mineras/deposito/:target/aguas_circundantes/datos/en-bruto/por-punto-monitoreo               => miners.target.emac.data.raw.bySource
/autoridades/                                                                                 => authorities
/autoridades/                                                                                 => authorities.home
/autoridades/deposito/:target/                                                                => authorities.target
/autoridades/deposito/:target/informacion-basica                                              => authorities.target.info
/autoridades/deposito/:target/indices/                                                        => authorities.target.indexes
/autoridades/deposito/:target/indices/:templateName/                                          => authorities.target.indexes.detail
/                                                                                             => communities
```
