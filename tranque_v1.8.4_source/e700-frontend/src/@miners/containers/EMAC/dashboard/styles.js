export const styles = theme => ({
    statusIcon: {
        fontSize: '20px'
    },
    statusOk: {
        color: '#38E47B',
        fontSize: 12
    },
    statusWarning: {
        color: '#FDFF3F',
        fontSize: 12
    },
    statusDisabled: {
        color: '#8E8E8E',
        fontSize: 12
    },
    noBorder: {
        border: 'none'
    },
    noWrap: {
        whiteSpace: 'nowrap'
    },
    chip: {
        display: 'flex',
        justifyContent: 'flex-start',
        paddingLeft: theme.spacing(2),
        borderRadius: '3px',
        backgroundColor: '#323232',
        width: '100%'
    },
    impactIndexText: {
        fontSize: 12
    },
    indexRow: {
        backgroundColor: 'transparent',
        border: 'none',
        '& td': {
            padding: '0',
            border: 'none',
            '&>div': {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                height: '50px',
                width: '100%',
                backgroundColor: '#161719',
                padding: '0 20px',
                margin: '5px 0'
            }
        },
        '&.clickable td>div': {
            cursor: 'pointer'
        },
        '&.clickable:hover td>div': {
            backgroundColor: '#252628'
        }
    },
    tableHead: {
        fontSize: 12,
        whiteSpace: 'nowrap'
    },
    rowLabel: {
        fontSize: 14
    }
});
