import React from 'react';

/**
 * A component for placing a icon and a text in one row.
 *
 * @version 1.0.0
 * @author [Natalia Vidal](https://gitlab.com/nattoV)
 */
export function IconTextGrid({icon, text, space, iconRight}) {
    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            {iconRight ? null : icon}
            <div style={{[iconRight ? 'marginRight' : 'marginLeft']: space ? space : '5px'}}>{text}</div>
            {iconRight ? icon : null}
        </div>
    );
}

export default IconTextGrid;
