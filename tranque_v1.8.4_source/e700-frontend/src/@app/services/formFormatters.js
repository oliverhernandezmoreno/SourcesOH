const FLOATING_POINT_SEPARATOR = ',';
const THOUSANDS_SEPARATOR = '.';

function addThousandsSeparator(str = '') {
    const str2 = str.trim().replace(/\./g, '');
    const parts = str2.split(',', 2);
    const intPart = parts[0];
    const formattedIntPart = intPart.split('').reverse().map((l, i) => {
        if (i && i % 3 === 0) {
            return `${l}${THOUSANDS_SEPARATOR}`;
        }
        return l;
    })
        .reverse()
        .join('');
    if (parts.length === 1 || parts[1].length === 0) {
        return formattedIntPart;
    }
    return `${formattedIntPart}${FLOATING_POINT_SEPARATOR}${parts[1]}`;
}

function removeThousandsSeparator(str = '') {
    return str
        .replace(new RegExp(`\\${THOUSANDS_SEPARATOR}/g`), '')
        .replace(FLOATING_POINT_SEPARATOR, '.');
}

const formatter = (forward, backward) => ({forward, backward});

export const formatters = {
    thousandsSeparator: formatter(
        addThousandsSeparator,
        removeThousandsSeparator
    )
};
