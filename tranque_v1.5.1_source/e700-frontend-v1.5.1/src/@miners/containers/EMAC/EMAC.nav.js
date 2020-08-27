import SubMenu from '@miners/containers/layout/SubMenu';
import {EXECUTORS} from '@miners/containers/EMAC/EMACETL';
import {reverse} from '@app/urls';

function irSup(target) {
    return {
        title: 'Aguas superficiales',
        children: [
            {
                title: 'Riego',
                path: reverse('miners.target.emac.data.irSuperficial.riego', {target})
            },
            {
                title: 'Consumo humano/bebida animal',
                path: reverse('miners.target.emac.data.irSuperficial.aguaPotable', {target})
            },
            {
                title: 'Uso recreacional',
                path: reverse('miners.target.emac.data.irSuperficial.recreacion', {target})
            },
            {
                title: 'Protección vida acuática',
                path: reverse('miners.target.emac.data.irSuperficial.vidaAcuatica', {target})
            }
        ]
    };
}

function irSub(target) {
    return {
        title: 'Aguas subterráneas',
        children: [
            {
                title: 'Riego',
                path: reverse('miners.target.emac.data.irSubterranean.riego', {target})
            },
            {
                title: 'Consumo humano/bebida animal',
                path: reverse('miners.target.emac.data.irSubterranean.aguaPotable', {target})
            },
            {
                title: 'Protección vida acuática',
                path: reverse('miners.target.emac.data.irSubterranean.vidaAcuatica', {target})
            },
            {
                title: 'Uso recreacional',
                path: reverse('miners.target.emac.data.irSubterranean.recreacion', {target})
            }
        ]
    };
}

function etl(target) {
    return [
        {
            title: 'Ingresar datos',
            children: [
                ...EXECUTORS.map(({title, subtitle, executor}) => ({
                    title,
                    subtitle,
                    path: reverse('miners.target.emac.massLoad', {target, executor})
                }))
            ]
        },
        {
            title: 'Registro de ingresos',
            path: reverse('miners.target.emac.data.load', {target})
        }
    ];
}

function rawData(target) {
    return [
        {
            subtitle: 'Datos en bruto y sus tendencias'
        },
        {
            title: 'Por variable',
            path: reverse('miners.target.emac.data.raw.byVariable', {target})
        },
        {
            title: 'Por punto de monitoreo',
            path: reverse('miners.target.emac.data.raw.bySource', {target})
        }
    ];
}

function dataNav(target) {
    return [
        ...etl(target),
        SubMenu.Separator,
        {
            subtitle: 'Índices de riesgo'
        },
        irSup(target),
        irSub(target),
        SubMenu.Separator,
        ...rawData(target)
    ];
}


export function getEMACDrawerItems(target) {
    return [
        {
            title: 'Dashboard',
            path: reverse('miners.target.emac.dashboard', {target}),
            icon: 'RemoveRedEye'
        },
        {
            title: 'Datos',
            path: reverse('miners.target.emac.data', {target}),
            icon: 'Assessment'
        },
        {
            title: 'Alertas y eventos',
            path: reverse('miners.target.emac.tickets', {target}),
            icon: 'Flag',
        },
    ];
}

export function getEMACSubMenuItems(target) {
    return dataNav(target);
}

export const EMACIRRoutes = [
    {
        route: 'miners.target.emac.data.irSuperficial.riego',
        props: {
            template: 'emac-mvp.riego.superficial.ir',
            indexType: 'riego',
            waterType: 'superficial'
        }
    },
    {
        route: 'miners.target.emac.data.irSuperficial.aguaPotable',
        props: {
            template: 'emac-mvp.agua-potable.superficial.ir',
            indexType: 'agua-potable',
            waterType: 'superficial'
        }
    },
    {
        route: 'miners.target.emac.data.irSuperficial.recreacion',
        props: {
            template: 'emac-mvp.recreacion.superficial.ir',
            indexType: 'recreacion',
            waterType: 'superficial'
        }
    },
    {
        route: 'miners.target.emac.data.irSuperficial.vidaAcuatica',
        props: {
            template: 'emac-mvp.vida-acuatica.superficial.ir',
            indexType: 'vida-acuatica',
            waterType: 'superficial'
        }
    },
    {
        route: 'miners.target.emac.data.irSubterranean.riego',
        props: {
            template: 'emac-mvp.riego.subterraneo.ir',
            indexType: 'riego',
            waterType: 'subterraneo'
        }
    },
    {
        route: 'miners.target.emac.data.irSubterranean.aguaPotable',
        props: {
            template: 'emac-mvp.agua-potable.subterraneo.ir',
            indexType: 'agua-potable',
            waterType: 'subterraneo'
        }
    },
    {
        route: 'miners.target.emac.data.irSubterranean.recreacion',
        props: {
            template: 'emac-mvp.recreacion.subterraneo.ir',
            indexType: 'recreacion',
            waterType: 'subterraneo'
        }
    },
    {
        route: 'miners.target.emac.data.irSubterranean.vidaAcuatica',
        props: {
            template: 'emac-mvp.vida-acuatica.subterraneo.ir',
            indexType: 'vida-acuatica',
            waterType: 'subterraneo'
        }
    }
];
