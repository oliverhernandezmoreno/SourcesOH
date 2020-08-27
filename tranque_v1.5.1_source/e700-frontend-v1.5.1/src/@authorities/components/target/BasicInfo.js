import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {COLORS} from '@authorities/theme';
import TMaterialTable from '@app/components/utils/TMaterialTable';


/**
 * A component for rendering a table used for monitoring.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
class BasicInfo extends Component {
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
            cellStyle: {background: COLORS.secondary.dark,
                width: '200px'}
        },
        { field: 'value' }];
    }


    /**
    * Function triggered to get the table data.
    *
    * @public
    */
    formatTableData() {
        const data = this.props.data;
        let basicData = [];
        let metaData = [];
        if (data && Object.keys(data).length > 0) {
            // Name/State/Type/Commune
            basicData.push({name: 'Nombre', value: data.name},
                {name: 'Estado operacional', value: data.state_description},
                {name: 'Tipo', value: data.type_description});

            // Zone (Commune/Region/Province)
            if (data.zone && data.zone.length > 0) {
                if (data.zone.type && data.zone.name) {
                    basicData.push({name: data.zone.type, value: data.zone.name});
                }
                if (data.zone.zone_hierarchy) {
                    data.zone.zone_hierarchy.forEach((item) => {
                        if (item.name && item.type && item.type !== 'pais') {
                            basicData.push({name: item.type, value: item.name});
                        }
                    });
                }
            }

            // Meta (Work/Entity/Vol/Ton/Source)
            if (data.meta) {
                metaData = Object.keys(data.meta).map((key) => {
                    return data.meta[key]; //{name: "...", value: ..., ...}
                });
            }
            return basicData.concat(metaData.filter((item) => item && item.name && item.value));
        }
        return [];
    }


    /**
    * Render this component.
    *
    * @public
    */
    render() {
        return (
            <TMaterialTable
                title="Información básica del depósito"
                data={this.formatTableData()}
                columns={this.getMonitoringColumns()}
                options={{sorting: false, search: false, paging: false, header: false
                }}
                localization={{body: {emptyDataSourceMessage: 'No hay información disponible'}}}
            />
        );
    }
}

BasicInfo.propTypes = {
    data: PropTypes.object.isRequired
};

export default BasicInfo;
