import React from 'react';
import PropTypes from 'prop-types';
import {FormControl, InputLabel, MenuItem, Select, Typography} from '@material-ui/core';



function getMenuItem(item, index) {
    return (
        <MenuItem key={index} value={item.value} disabled={item.disabled}>
            <Typography component={'div'}>{item.label}</Typography>
        </MenuItem>
    );
}

export function TSelect({field, menuItems, selected, hideDefault, onChange, defaultValue, inputProps, formControlVariant, disabled,
    formControlStyle, selectStyle, labelStyle, labelProps}) {
    const labelId = 'selectLabel_' + field;
    return (
        <FormControl fullWidth disabled={disabled} className={formControlStyle} variant={formControlVariant}>
            {field ? <InputLabel {...labelProps} style={labelStyle} id={labelId}>{field}</InputLabel> : ''}
            <Select
                className={selectStyle}
                labelId={labelId}
                value={menuItems.length === 0 ? '' : selected}
                onChange={(event) => onChange ? onChange(event) : null}
                MenuProps={{
                    anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left'
                    },
                    transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left'
                    },
                    getContentAnchorEl: null,
                }}
                inputProps={inputProps}>

                {!hideDefault && <MenuItem key={'-'} value="">
                    <em><Typography>{(defaultValue ? defaultValue : '')}</Typography></em>
                </MenuItem>}
                {menuItems && menuItems.map(getMenuItem)}
            </Select>
        </FormControl>
    );
}

TSelect.propTypes = {
    field: PropTypes.string,
    menuItems: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    hideDefault: PropTypes.bool
};


export default TSelect;
