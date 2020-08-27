import {createMuiTheme} from '@material-ui/core/styles/index';

export const theme = createMuiTheme({
    overrides: {
        MuiStepConnector: { // Stepper Connector
            line: { // Center the Connector between Steps
                marginLeft: '1%',
                marginRight: '1%'
            }
        },
        MuiChip: {
            label: {
                overflow: "hidden"
            }
        },
        MuiStepper: {
            root: {
                background: 'none',
                border: 'none',
            },
        },
        MuiCard: {
            root: {
                background: 'none',
                border: 'none',
                boxShadow: 'none',
            },
        },
        MuiDialog: {
            paper: {
                background: '#353535',
                color: '#fff',
            },
        },
    },
    palette: {
        type: 'dark',
        primary: {
            main: '#484848'
        },
        secondary: {
            main: '#656565'
        },
        background: {
            default: '#353535',
            paper: '#353535'
        },
        white: {
            dark: '#aaa',
            default: '#fff'
        }
    },
    shadows: Array(25).fill('none')
});

export default theme;
