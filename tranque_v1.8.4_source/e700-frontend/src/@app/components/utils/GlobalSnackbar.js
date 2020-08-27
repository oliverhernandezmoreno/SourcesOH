import React from 'react';
import PropTypes from 'prop-types';
import {Snackbar} from '@material-ui/core';
import {SnackbarContentWrapper} from '@app/components/utils/SnackbarContentWrapper';
import {snackbarActions} from '@app/actions/snackbar.actionCreators';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';


function GlobalSnackbar({actions, anchorOrigin,
    openGlobalSnackbar,
    message, variant,
    autoHideDuration}) {
    return (
        <Snackbar anchorOrigin={anchorOrigin || {vertical: 'bottom', horizontal: 'left'}}
            open={openGlobalSnackbar}
            onClose={() => actions.closeSnackbar()}
            autoHideDuration={autoHideDuration || 3000}
        >
            <SnackbarContentWrapper onClose={() => actions.closeSnackbar()}
                variant={variant || 'info'}
                message={message}
            />
        </Snackbar>
    );
}

const mapStateToProps = state => {
    return { openGlobalSnackbar: state.globalSnackbar.open_snackbar,
        anchorOrigin: state.globalSnackbar.snackbar_anchorOrigin,
        message: state.globalSnackbar.snackbar_message,
        variant: state.globalSnackbar.snackbar_variant,
        autoHideDuration: state.globalSnackbar.snackbar_autoHideDuration };
};

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators(snackbarActions, dispatch) };
}

GlobalSnackbar.propTypes = {
    message: PropTypes.any.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(GlobalSnackbar);