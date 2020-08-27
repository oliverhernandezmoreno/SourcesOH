import {createMuiTheme} from '@material-ui/core/styles';
import {blue, grey} from '@material-ui/core/colors';

export const COLORS = {
    chart: {
        variable: {
            primary: {
                main: '#89c4f4',
                prediction: '#19b5fe',
                area60: '#199ee0',
                area95: '#188eca'
            },
            secondary: {
                main: '#dcc6e0',
                prediction: '#a9a3cd',
                area60: '#948eb4',
                area95: '#76739b'
            }
        }
    },
    states: {
        success: '#37e47b',
    },
    tickets: {
        groups: {
            groupA: '#48DF74',
            groupB: '#96E44B',
            groupC: '#FAFE4A',
            groupD: '#FD664B',
            groupGrey: '#b0b0b0'
        }
    },
    buttons: {
        contained: '#199ee0'
    }
};

export const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: grey['800']
        },
        secondary: {
            main: '#303030'
        },
        background: {
            default: '#161719'
        }
    },
    typography: {
        useNextVariants: true
    },

    overrides: {
        MuiStepIcon: {
            root: {
                color: blue[300],
                '&$active': {
                    color: blue[800]
                },
                '&$completed': {
                    color: blue[800]
                }
            }
        },
        MuiButton: {
            outlined: {
                color: blue[400],
                borderColor: blue[400],
                paddingLeft: '8px',
                paddingRight: '8px',
                '&:hover': {
                    color: blue[300],
                    borderColor: blue[300]
                }
            },
            containedPrimary: {
                color: 'white',
                backgroundColor: blue[600],
                '&:hover': {
                    backgroundColor: blue[800]
                },
                '&:disabled': {
                    backgroundColor: blue[400]
                }
            }
        },
        MuiSwitch: {
            colorSecondary: {
                '&$checked': {
                    color: '#53b7ff'
                },
                '&$checked + $track': {
                    backgroundColor: '#99DBF6'
                }
            }
        }
    }
});

export default theme;
