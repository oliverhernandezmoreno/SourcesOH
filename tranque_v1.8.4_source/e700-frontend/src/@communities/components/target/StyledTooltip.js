import {withStyles} from '@material-ui/core/styles';
import {Tooltip} from '@material-ui/core';

const tooltipStyle = {
    tooltip: {
        maxWidth: 1000,
        backgroundColor: '#FFFFFF',
        color: '#000000',
        border: '1px solid'
    }
}

export const StyledTooltip = withStyles(tooltipStyle)(Tooltip);
