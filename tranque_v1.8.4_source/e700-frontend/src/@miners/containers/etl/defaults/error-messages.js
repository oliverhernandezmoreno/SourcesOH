import {formatDecimal} from '@app/services/formatters';

// Blanket messages used for all executors.
const commonErrors = {
    'parsing-error': () => 'No fue posible leer el archivo',
    'delivery-error': () => 'Ocurrió un error inesperado al intentar confirmar los datos precargados',
    'out-of-range': (error) => {
        const symbols = {gt: '>', lt: '<', gte: '≥', lte: '≤'};
        return [
            'Valor numérico fuera del rango admitido',
            `(valor informado: ${formatDecimal(error.value, 16)};`,
            `valor límite: ${symbols[error.operator] || ''} ${formatDecimal(error.limit, 16)})`,
        ].join(' ');
    },
    'value-mismatch': (error) =>
        [
            `El valor de ${error.series || 'la variable'}`,
            `en ${error.source || 'el punto'}`,
            'no coincide con otras ocurrencias del mismo dato en el archivo',
        ].join(' '),
    'invalid-ionic-balance': (error) =>
        [
            `El balance iónico para el punto ${error.source || ''}`,
            error.ionicBalance ? `es ${formatDecimal(error.ionicBalance)}` : 'no pudo ser calculado',
        ].join(' '),
    'invalid-timestamp': () => 'Fecha no válida',
    'invalid-value': () => 'Valor numérico no válido',
    'invalid-coordinate': () => 'La coordenada indicada no es válida',
    'invalid-series': () => 'El parámetro o variable fue omitida o es incorrecta',
    'invalid-source': () => 'El punto de monitoreo o instrumento fue omitido o es incorrecto',
    'invalid-group': () => 'La agrupación fue omitida o es incorrecta',
    'missing-series': (error) => `La variable ${error.variable || ''} no está definida`,
    'missing-source': () => 'El punto de monitoreo o instrumento no existe',
    'missing-group': () => 'La agrupación indicada no existe',
};

// All specific errors, nested according to the executor.
const executorErrors = {
    'ef_deformation_inclinometers': {
        'invalid-source': () => 'La cota de medición no es válida',
        'invalid-group': () => 'El inclinómetro o clino-extensómetro no es válido',
        'missing-group': () =>
            'El inclinómetro o clino-extensómetro indicado no coincide con los registrados en el sistema',
        'missing-source': () => 'La cota de medición no está configurada',
    },
    'ef_deformation_monoliths': {
        'invalid-group': () => 'El sector fue omitido o no es válido',
        'invalid-source': () => 'El monolito fue omitido o no es válido',
        'missing-source': () => 'El monolito indicado no coincide con los registrados en el sistema',
        'missing-group': () => 'El sector indicado no coincide con los registrados en el sistema',
    },
    'ef_granulometry': {
        'invalid-meta-mesh': () => 'La malla fue omitida o es inválida',
        'invalid-meta-sample': () => 'La muestra fue omitida o es inválida',
        'invalid-meta-aperture': () => 'La abertura de la malla fue omitida o es inválida',
    },
    'ef_parameter:densidad': {
        'invalid-group': () => 'El sector fue omitido o no es válido',
        'missing-group': () => 'El sector indicado no coincide con los registrados en el sistema',
    },
    'ef_parameter:muro_laguna': {
        'invalid-group': () => 'El sector fue omitido o no es válido',
        'missing-group': () => 'El sector indicado no coincide con los registrados en el sistema',
    },
    'ef_parameter:nivel_freatico': {
        'invalid-source': () => 'El instrumento fue omitido o no es válido',
        'missing-source': () =>
            'El instrumento no coincide con los instrumentos de medición de nivel freático registrados en el sistema',
    },
    'ef_parameter:piezometria': {
        'invalid-source': () => 'El instrumento fue omitido o no es válido',
        'missing-source': () => 'El instrumento no coincide con los piezómetros registrados en el sistema',
        'invalid-group': () => 'El sector fue omitido o no es válido',
        'missing-group': () => 'El sector indicado no coincide con los registrados en el sistema',
    },
    'ef_topographic': {
        'invalid-source': () => 'El perfil fue omitido o no es válido',
        'missing-source': () => 'El perfil indicado no coincide con los registrados en el sistema',
        'invalid-x-coord': () => 'El avance horizontal fue omitido o no es válido',
        'invalid-coordinate': () => 'El avance horizontal fue omitido o no es válido',
        'missing-coordinate': () => 'El avance horizontal fue omitido',
        'duplicate_coordinate': () =>
            'El avance horizontal del perfil está duplicado con otra fila del archivo',
        'invalid-label': (error) =>
            `La descripción "${error.label}" no es válida. Las opciones disponibles son: ${error.options
                .map((op) => '"' + op + '"')
                .join(', ')}`,
    },
};

const primaryMessageForError = (executor, error) => {
    const formatter = (executorErrors[executor] ?? {})[error.code] ?? commonErrors[error.code];
    if (!formatter) {
        return null;
    }
    return formatter(error);
};

const secondaryMessageForError = (executor, error) =>
    typeof error.linenumber !== 'undefined'
        ? `En línea ${error.linenumber} hoja '${error.sheet_name}'`
        : null;

export const getFormattedError = (executor, error) => {
    const primary = primaryMessageForError(executor, error);
    if (primary === null) {
        return null;
    }
    const secondary = secondaryMessageForError(executor, error);
    return {primary, secondary};
};
