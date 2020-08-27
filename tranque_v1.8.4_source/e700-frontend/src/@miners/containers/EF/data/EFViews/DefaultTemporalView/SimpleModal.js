import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';


const styles = theme => ({
    modal: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.4)',
        position: 'fixed',
        top: '0',
        left: '0',
        zIndex: '1201',
        display: 'none',
    },
    openModal: {
        display: 'grid',
    },
    modalContent: {
        gridArea: '1/1',
        margin: 'auto',
        maxWidth: '80%',
        padding: '1em',
        backgroundColor: '#161719',
        maxHeight: '70%',
        overflow: 'auto',
    },
});

class SimpleModal extends Component {

    static defaultProps = {
        /* Whether the modal is displayed or not **/
        isModalOpen: false,
        /* Function to call when modal is closed **/
        closeModal: () => {},
    }

    static propTypes = {
        children: PropTypes.object
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={[classes.modal, this.props.isModalOpen ? classes.openModal:''].join(' ')} 
                onClick={this.props.closeModal}>
                <div className={classes.modalContent}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

SimpleModal.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SimpleModal);
