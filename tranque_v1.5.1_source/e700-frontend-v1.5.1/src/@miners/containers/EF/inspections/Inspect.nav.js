import {reverse} from '@app/urls';

function InspectAndEvaluation(target) {
    return [
        {   title: 'Ingresar inspección diaria',
            path: reverse('miners.target.ef.inspection-and-evaluation.inspection', {target, executor: 'direct:triggers-and-design'}),
        },
        {   title: 'Ingresar evaluación mensual',
            path: reverse('miners.target.ef.inspection-and-evaluation.evaluation', {target, executor: 'direct:vulnerability'}),
        },
        {   title: 'Registros de inspección',
            path: reverse('miners.target.ef.inspection-and-evaluation.registry', {target})
        }
    ];
}


function InspectNav(target) {
    return [
        ...InspectAndEvaluation(target),
    ];
}

export function getInspectSubMenuItems(target) {
    return InspectNav(target);
}
