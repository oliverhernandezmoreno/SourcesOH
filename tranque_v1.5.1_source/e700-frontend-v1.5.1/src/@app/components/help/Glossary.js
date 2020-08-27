import React, {Component} from 'react';

import {COLORS} from '@authorities/theme';
import TMaterialTable from '@app/components/utils/TMaterialTable';
import {withStyles} from '@material-ui/core/styles';
import {Typography, Container} from '@material-ui/core';
import {glossary} from '@app/services/help/glossaryItems';


const styles = theme => ({
    container: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(2),
    },
    title: {
        paddingBottom: theme.spacing(2),
        paddingLeft: theme.spacing(4),
    }
});

/**
 * A component for rendering a glossary.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class Glossary extends Component {
    /**
     * Constructor of the component
     *
     * @param {props} the props.
     * @public
     */
    constructor(props) {
        super(props);
        this.getMonitoringColumns = this.getMonitoringColumns.bind(this);
    }

    /**
    * Function triggered to get the table columns.
    *
    * @public
    */
    getMonitoringColumns() {
        return [{ field: 'name',
            cellStyle: {background: COLORS.secondary.dark, width: '200px'}
        },
        { field: 'value',
            cellStyle: {whiteSpace: 'pre-line', textAlign: 'justify'}}];
    }


    /**
    * Render this component.
    *
    * @public
    */
    render() {
        const {classes} = this.props;
        return (
            <Container maxWidth="lg" className={classes.container}>
                <Typography variant="h4" className={classes.title}>
                    Glosario de términos
                </Typography>
                <TMaterialTable
                    data={glossary}
                    columns={this.getMonitoringColumns()}
                    options={{
                        sorting: false,
                        paging: false,
                        header: false,
                        showTitle: false
                    }}
                    localization={{body: {emptyDataSourceMessage: 'No hay información disponible'}}}
                />
            </Container>
        );
    }
}


export default withStyles(styles)(Glossary);
