import React from 'react';
import PropTypes from 'prop-types';
import {Slide, useScrollTrigger} from '@material-ui/core';

export function HideOnScroll(props) {
    const {children} = props;
    const trigger = useScrollTrigger();

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

HideOnScroll.propTypes = {
    children: PropTypes.element.isRequired
};
