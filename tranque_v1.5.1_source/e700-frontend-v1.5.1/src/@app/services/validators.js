export const minLength = (min) => (t) => {
    if (typeof t === 'undefined' || t === null) {
        return min <= 0;
    }
    return `${t}`.length >= min;
};

export const required = (flag) => (v) => {
    if (!flag) {
        return true;
    }
    if (typeof v === 'undefined') {
        return false;
    }
    if (v === null) {
        return false;
    }
    if (typeof v === 'string' && v.trim().length === 0) {
        return false;
    }
    return true;
};

export const isNumber = (flag) => (n) => {
    if (typeof n === 'number') {
        return flag;
    }
    if (typeof n === 'string' && n.trim().length === 0) {
        return true;
    }
    if (typeof n === 'string' && (/^([+-]?[0-9,]*(\.[0-9]*)?)$/).test(n.trim())) {
        return flag;
    }
    return !flag;
};

export const lessThan = x => n => n<x;

export const greaterThan = x => n => n>x;

// Source: https://github.com/jlobos/rut.js/blob/master/index.js
export const isRUT = (flag) => (t) => {
    if (typeof t !== 'string') {
        return !flag;
    }
    if (t.trim().length === 0) {
        return true;
    }
    if (!/^0*(\d{1,3}(\.?\d{3})*)-?([\dkK])$/.test(t)) {
        return !flag;
    }
    const rut = t.replace(/^0+|[^0-9kK]+/g, '').toUpperCase();
    let body = parseInt(rut.slice(0, -1), 10);
    let m = 0;
    let s = 1;
    while (body > 0) {
        s = (s + (body % 10) * (9 - m++ % 6)) % 11;
        body = Math.floor(body / 10);
    }
    const dv = s > 0 ? `${(s - 1)}` : 'K';
    return dv === rut.slice(-1) ? flag : !flag;
};

// Define user messages for each failure state.
export const MESSAGES = {
    minLength: (n) => `El largo mínimo de caracteres es ${n}`,
    required: (flag) => flag ? 'Este campo es requerido' : null,
    isNumber: (flag) => flag ? 'Se aceptan sólo números' : 'No se aceptan números',
    isRUT: (flag) => flag ? 'Se aceptan sólo RUT válidos' : null,
    lessThan: (n) => `El valor debe ser inferior a ${n}`,
    greaterThan: (n) => `El valor debe ser superior a ${n}`
};

export const validators = {
    minLength,
    required,
    isNumber,
    isRUT,
    lessThan,
    greaterThan,
    MESSAGES
};
