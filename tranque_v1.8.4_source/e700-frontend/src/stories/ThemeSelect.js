import {Container, Grid, MuiThemeProvider} from '@material-ui/core';
import React, {useState} from 'react';
import {theme as minersTheme} from '@miners/theme';
import {theme as authTheme} from '@authorities/theme';
import {theme as e700Theme} from '@e700/theme';
import {TSelect} from '@app/components/utils/TSelect';

/**
 * Wrapper component for stories to display, at the top of the story, a select for the active theme
 */
export function ThemeSelect({children, defaultTheme}) {
    const items = [
        {label: 'autoridad', value: authTheme},
        {label: 'minera', value: minersTheme},
        {label: 'e700', value: e700Theme},
        {label: 'comunidades', value: '', disabled: true}
    ];
    const [activeTheme, setTheme] = useState((items.find(i => i.label === defaultTheme) || {value: minersTheme}).value);
    return (
        <MuiThemeProvider theme={activeTheme}>
            <div
                style={{
                    width: '100%',
                    backgroundColor: activeTheme.palette.background.default
                }}>
                <Container maxWidth="lg">
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TSelect
                                style={{minWidth: '200px'}}
                                field="Cambiar tema"
                                hideDefault
                                menuItems={[
                                    {label: 'autoridad', value: authTheme},
                                    {label: 'minera', value: minersTheme},
                                    {label: 'e700', value: e700Theme},
                                    {label: 'comunidades', value: '', disabled: true}
                                ]}
                                onChange={(event) => setTheme(event.target.value)}
                                selected={activeTheme}/>
                        </Grid>
                        <Grid item xs={12}>
                            <div>
                                {children}
                            </div>
                        </Grid>
                    </Grid>
                </Container>
            </div>
        </MuiThemeProvider>
    );
}
