import {createMuiTheme, withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {blue} from '@material-ui/core/colors';

export const COLORS = {
    primary: {
        main: '#484848',
        dark: '#2a2a2a',
        contrastText: '#fff'
    },
    secondary: {
        main: '#656565',
        contrastText: '#fff'
    },
    background: {
        default: '#353535'
    },
    disabled: {
        main: '#c9c9c9'
    },
    error: {
        main: '#ff493b'
    },
    success: {
        main: '#38E47B'
    },
    warning: {
        main: '#eeff26'
    },
    black: {
        main: '#000'
    },
    blue: {
        main: '#2664AD',
        dark: '#20589E'
    }
};

export const theme = createMuiTheme({
    palette: {
        type: 'dark',
        ...COLORS
    },
    overrides: {
        MuiTypography: {
            subtitle2: {
                fontSize: '14px',
                fontWeight: 'bold'
            },
            body2: {
                fontSize: '13px'
            },
            h6: {
                fontWeight: 'bold'
            }
        },
        MuiTableCell: {
            root: {
                textAlign: 'left',
                size: 'small'
            }
        },
        MuiTableRow: {
            root: {
                // background: COLORS.background.default
            }
        },
        MuiButton: {
            root: {
                borderRadius: '3px',
                height: '36px',
                margin: '5px',
                textTransform: 'none'
            },
            outlined: {
                color: blue[400],
                borderColor: blue[400],
                paddingLeft: '8px',
                paddingRight: '8px',
                '&:hover': {
                    color: blue[300],
                    borderColor: blue[300]
                }
            }
        },
        MuiFormGroup: {
            root: {
                padding: '10px'
            }
        },
        MuiFormControl: {
            root: {
                marginRight: '0px'
            }
        },
        MuiInputLabel: {
            root: {
                fontSize: '14px'
            }
        },
        MuiSelect: {
            root: {
                textAlign: 'left'
            }
        },
        MuiSwitch: {
            colorPrimary: {
                '&$checked': {
                    color: COLORS.blue.main
                },
                '&$checked + $track': {
                    backgroundColor: COLORS.blue.dark
                }
            }
        },
        MuiTooltip: {
            tooltip: {
                backgroundColor: COLORS.primary.dark
            }
        }
    }
});

export const BlueButton = withStyles((theme) => ({
    root: {
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.blue.main,
        '&:hover': {
            backgroundColor: theme.palette.blue.dark,
        },
    },
}))(Button);

export default theme;
