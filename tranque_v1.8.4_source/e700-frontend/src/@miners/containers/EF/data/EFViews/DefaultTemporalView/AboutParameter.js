import React from 'react';
import HelpIcon from '@material-ui/icons/Help';
import {Link, Dialog, DialogContent, withStyles} from '@material-ui/core';
import ImageMapContainer from '@miners/containers/EF/data/EFViews/maps/ImageMapContainer';

const styles = theme => ({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: '#303030',
    },
    container: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'stretch',
    },
    buttonLink: {
        color: '#24aff4',
        textDecoration: 'underline',
        display: 'flex',
        justifyContent: 'center',
    },
});

const SectorsDialog = (props) => {
    const { onClose, open } = props;
    return (
        <Dialog onClose={onClose} maxWidth="xl" aria-labelledby="sectors-dialog-title" open={open}>
            <DialogContent>
                <ImageMapContainer
                    width={600}
                    map_canonical_name='sectors-map'
                    name='Sectorización de muros(s)'
                />
            </DialogContent>
        </Dialog>
    );
}

const AboutParameter = (props) => {
    const {classes, wikiLink} = props;
    const [openMap, setOpenMap] = React.useState(false);

    const handleMapOpen = () => {
        setOpenMap(true);
    }

    const handleMapClose = () => {
        setOpenMap(false);
    }

    return (
        <div className={classes.container}>
            <Link className={classes.buttonLink}
                variant="body2"
                target="_blank"
                href={wikiLink} >
                <HelpIcon></HelpIcon>
                <span>
                    Sobre este parámetro
                </span>
            </Link>
            <Link className={classes.buttonLink}
                component="button" variant="body2"
                onClick={event => {
                    handleMapOpen();
                }} >
                Ver sectores
            </Link>
            <SectorsDialog
                open={openMap}
                onClose={handleMapClose} >
            </SectorsDialog>
        </div>
    );
}

export default withStyles( styles )( AboutParameter );
