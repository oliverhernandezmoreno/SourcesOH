import React, {Component} from 'react';
import {withStyles} from '@material-ui/core';
import TMaterialTable from '@app/components/utils/TMaterialTable';
import InstrumentsMap from '@app/components/map/InstrumentsMap';


const styles = theme => ({
    table: {
        paddingBottom: 20
    }
});

class DetailedTargetMap extends Component {

    render() {
        const {dataSources, classes, mapProps, tableColumns, name} = this.props;
        const InstrumentMapProps = {dataSources, name, mapProps};
        return <>
            <InstrumentsMap {...InstrumentMapProps}/>
            {
                tableColumns &&
                <div className={classes.table}>
                    <TMaterialTable
                        data={dataSources}
                        columns={tableColumns}
                        options={{paging: false, search: false, sorting: false}}
                    />
                </div>
            }
        </>;
    }
}

export default withStyles(styles)(DetailedTargetMap);
