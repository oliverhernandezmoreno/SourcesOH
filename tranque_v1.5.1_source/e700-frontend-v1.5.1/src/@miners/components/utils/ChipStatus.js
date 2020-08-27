import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {makeStyles} from '@material-ui/core/styles';
import {FiberManualRecord, RadioButtonUnchecked} from '@material-ui/icons';
import classNames from 'classnames';

const useStyles = makeStyles(theme => ({
    statusIcon: {
        fontSize: '14px',
        marginRight: '5px',
        '&.small': {
            fontSize: '11px',
            marginRight: '6px',
        }
    },
    statusOk: {
        color: '#38E47B'
    },
    statusWarning: {
        color: '#FDFF3F'
    },
    statusNoData: {
        color: '#FFFFFF'
    },
    chip: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'auto',
        padding: '5px 10px',
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '17px',
        backgroundColor: '#222232',
        border: '1px solid #46465F',
        borderRadius: '13px',
        margin: '0 8px 12px 0',
        '&:hover': {
            backgroundColor: '#353546'
        }
    },
    noMargin: {
        margin: 0
    },
    clickable: {
        cursor: 'pointer'
    },
    invisibleLink: {
        color: 'inherit',
        padding: 0,
        margin: 0,
        textDecoration: 'none',
        '&:hover': {
            color: 'inherit',
            textDecoration: 'none'
        },
        '&:visited': {
            color: 'inherit',
            textDecoration: 'none'
        },
        '&:active': {
            color: 'inherit',
            textDecoration: 'none'
        }
    }
}));

export function ChipStatus({text, status, onClick, noMargin, className, link, linkExternal, ...otherProps}) {
    const classes = useStyles();
    let _status;
    let icon;
    switch (status) {
        case 'ok':
            icon = <FiberManualRecord className={classes.statusIcon}/>;
            _status = classes.statusOk;
            break;
        case 'warning':
            icon = <FiberManualRecord className={classes.statusIcon}/>;
            _status = classes.statusWarning;
            break;
        case 'nodata':
            icon = <RadioButtonUnchecked className={`${classes.statusIcon} small`}/>;
            _status = classes.statusNoData;
            break;
        case 'na':
        default:
            _status = classes.statusNoData;
    }

    const _className = classNames(
        classes.chip,
        _status,
        {
            [classes.clickable]: onClick !== undefined,
            [classes.noMargin]: noMargin
        },
        className
    );

    const inner = (
        <div {...otherProps} onClick={onClick} className={_className}>
            {icon}
            <span>{text}</span>
        </div>
    );
    return link ?
        <Link to={link} {...(linkExternal ? {target: '_blank'} : {})} className={classes.invisibleLink}>{inner}</Link> :
        inner;
}

ChipStatus.propTypes = {
    text: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['ok', 'warning', 'nodata', 'na']).isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func
};
