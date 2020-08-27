export const formatUsername = (user) => {
    if (!user) {
        return '--';
    }
    const userName = user.first_name || user.last_name ?
        `${user.first_name} ${user.last_name}` :
        user.username;
    return userName.trim();
};

// Reference:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
const INTEGER_FORMAT = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
});

export const formatInteger = (n) => {
    if (typeof n === 'undefined' || n === null) {
        return '--';
    }
    if (typeof n === 'string' && (/^-?\d+$/).test(n)) {
        return formatInteger(parseInt(n, 10));
    }
    if (typeof n !== 'number') {
        throw new Error(`formatInteger called on ${typeof n} instance`);
    }
    return INTEGER_FORMAT.format(n);
};

export const formatDecimal = (n, decimals = 2) => {
    if (typeof n === 'undefined' || n === null) {
        return '--';
    }
    if (typeof n === 'string' && (/^-?\d+\.?\d*$/).test(n)) {
        return formatDecimal(parseFloat(n), decimals);
    }
    if (typeof n !== 'number') {
        throw new Error(`formatDecimal called on ${typeof n} instance`);
    }
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: decimals
    }).format(n);
};
