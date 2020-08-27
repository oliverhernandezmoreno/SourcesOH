const local = (key, absent = null) => window?.configuration?.[key] ?? absent;

const prefix = 'REACT_APP_';

const env = (key, absent = null) => {
    const composite = `${prefix}${key}`;
    return Object.keys(process.env).indexOf(composite) === -1 ?
        absent :
        process.env[composite];
};

export const DEBUG = env('DEBUG', '1') === '1';
export const API_HOST = local('API_HOST', env('API_HOST', 'http://localhost:8000/api'));
export const INCLUDED_ROUTES = env('INCLUDED_ROUTES', '*');
export const EXCLUDED_ROUTES = env('EXCLUDED_ROUTES', '');
export const DEFAULT_REDIRECT = env('DEFAULT_REDIRECT', 'public');

export const MOMENT_LOCALE = 'es';
export const DATE_FORMAT = 'DD-MM-YYYY';
export const ISO_DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm:ss';
export const DATE_TIME_FORMAT = 'D MMM YYYY, kk:mm';
export const DEFAULT_REFRESH_TIME = 60000;
export const DEFAULT_CACHE_TIME = 10 * 60 * 1000;
export const DATETIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;
export const MAX_SIZE_FILE_BT = 25000000;
export const MAX_SIZE_FILE_MB = MAX_SIZE_FILE_BT/1000000;
export const MOBILE_WIDTH = 980;
export const ENABLE_PROFILE = false;
