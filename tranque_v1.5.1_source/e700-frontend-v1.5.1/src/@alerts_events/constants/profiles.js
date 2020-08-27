export const AUT_1 = 'authority-1';
export const AUT_2 = 'authority-2';
export const AUT_3 = 'authority-3';

export const MIN_1 = 'miner-1';
export const MIN_2 = 'miner-2';
export const MIN_3 = 'miner-3';
export const MIN_4 = 'miner-4';
export const MIN_5 = 'miner-5';

export function isProfile(profile, userProfile) {
    return userProfile === profile;
}

export function isApprovalLevel(level, approval_level) {
    return level === approval_level;
}

export function isMiner(profile) {
    return profile === MIN_1 ||
           profile === MIN_2 ||
           profile === MIN_3 ||
           profile === MIN_4;
}

export function isAuthority(profile) {
    return profile === AUT_1 ||
           profile === AUT_2 ||
           profile === AUT_3;
}

export function getSpanishProfileName(profile) {
    switch(profile) {
        case AUT_1:
            return 'Autoridad-1';
        case AUT_2:
            return 'Autoridad-2';
        case AUT_3:
            return 'Autoridad-3';
        case MIN_1:
            return 'Minera-1';
        case MIN_2:
            return 'Minera-2';
        case MIN_3:
            return 'Minera-3';
        case MIN_4:
            return 'Minera-4';
        default:
            return profile;
    }
}

