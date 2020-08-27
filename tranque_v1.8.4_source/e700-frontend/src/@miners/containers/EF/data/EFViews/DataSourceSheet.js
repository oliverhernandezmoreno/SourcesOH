import React, {Component} from 'react';
import { Typography, withStyles } from '@material-ui/core';
import InstrumentsMapContainer from '@miners/containers/EF/data/EFViews/maps/InstrumentsMapContainer';
import DownloadSheetButton from './DownloadSheetButton';

const styles = theme => ({
    file: {
        display: 'flex',
        flexDirection: 'column',
        background: '#262629',
        borderRadius: '5px',
        padding: theme.spacing(3),
        minHeight: '30rem',
        alignItems: 'flex-start'
    },
    fileHeader: {
        marginBottom: '2rem',
    },
    fileGrid: {
        display: 'grid',
        gridTemplateColumns: '30ch 30ch',
        gridColumnGap: '1rem',
        gridRowGap: '1rem',

    },
    button: {
        paddingTop: 30

    },
    map: {
        height: 400,
        width: '100%',
        marginBottom: 20
    }
});


class DataSourceSheet extends Component {

    getFields() {
        const {fileData, excludeSector, excludeDrenaje} = this.props;
        let fields = [];
        fields.push(['Ubicación', fileData?.location || '-']);
        if (!excludeSector) fields.push(['Sector', fileData?.sector || '-']);
        fields.push(['Coordenadas de instalación', fileData?.coords || '-']);
        if (!excludeDrenaje) fields.push(['Sistema de drenaje asociado', fileData?.drenaje || '-'])
        return fields;
    }

    render() {
        const { classes, dataSource, target } = this.props;
        return (<>
            <div className={classes.file}>
                <Typography variant="body1" color="textSecondary" className={classes.fileHeader}>
                    <b>FICHA</b>
                </Typography>

                <div className={classes.fileGrid}>
                    {this.getFields().map(([label, value]) => {
                        return (
                            <React.Fragment key={label}>
                                <Typography variant="body1" color="textSecondary">{label}</Typography>
                                <Typography variant="body1" color="textSecondary"><b>{value}</b></Typography>
                            </React.Fragment>
                        )
                    })}
                </div>
                <div className={classes.button}>
                    <DownloadSheetButton target={target} dataSource={dataSource}/>
                </div>
                <div className={classes.map}>
                    <InstrumentsMapContainer
                        map_canonical_name='instruments-map'
                        dataSources={[dataSource]}
                    />
                </div>
            </div>
        </>);
    }
}

export default withStyles(styles)(DataSourceSheet);
