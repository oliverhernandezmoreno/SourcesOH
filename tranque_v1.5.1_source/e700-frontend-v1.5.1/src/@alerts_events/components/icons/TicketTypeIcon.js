import React, {Component} from 'react';
import {Grid, withStyles} from '@material-ui/core';
import { NotificationsActive, RssFeed } from '@material-ui/icons';
import IconTextGrid from '@app/components/utils/IconTextGrid';
import { groupNames, A, B, C, D, RED_ALERT, YELLOW_ALERT, CLOSED } from '@alerts_events/constants/ticketGroups';
import {COLORS} from '@miners/theme';

const groupColors = COLORS.tickets.groups;

const styles = (theme) => ({
    spaceBetween: {
        paddingRight: 30
    },
    square: {
        margin: 1
    },
    twoRows: {
        maxWidth: 35,
        minWidth: 35,
        fontSize: 0
    }
})

class TicketTypeIcon extends Component {

    getSquare(filled, color, index) {
        const style = filled ? {fill: color} : {stroke: color, fill: 'transparent'};
        const width = 15; const height = 15;
        return (
            <svg key={index + (filled && 'filled')}
                width={width} height={height}
                className={this.props.classes.square}>
                <rect x="0" y="0"
                    width={width} height={height}
                    style={style} strokeWidth="3"/>
            </svg>
        );
    }

    getTwoRowsSquareIcon(color, filled, outlined) {
        const {classes} = this.props;
        let row1 = [];
        let row2 = [];
        for (var f = 0; f < filled; f ++) {
            if (row1.length < 2) row1.push(this.getSquare(true, color, f));
            else if (row2.length < 2) row2.push(this.getSquare(true, color, f));
        }
        for (var o = 0; o < outlined; o ++) {
            if (row1.length < 2) row1.push(this.getSquare(false, color, o));
            else if (row2.length < 2) row2.push(this.getSquare(false, color, o));
        }
        return (<div className={classes.twoRows}>{row1}{row2}</div>);
    }

    getOneRowSquaresIcon(color, filled, outlined) {
        let icon = [];
        for (var f = 0; f < filled; f ++) {
            icon.push(this.getSquare(true, color, f));
        }
        for (var o = 0; o < outlined; o ++) {
            icon.push(this.getSquare(false, color, o));
        }
        return icon;
    }

    // filled: Number of filled squares (always to the left)
    // outlined: Number of outlined squares (always to the right)
    getSquaresIcon(color, filled, outlined) {
        if (this.props.twoRows) {
            return this.getTwoRowsSquareIcon(color, filled, outlined);
        }
        return this.getOneRowSquaresIcon(color, filled, outlined);
    }

    getIconColor(group) {
        const {archived, evaluable, state} = this.props;
        const closed = state && state === CLOSED;
        if (archived || !evaluable || closed) return groupColors.groupGrey;
        switch(group) {
            case RED_ALERT:
                return groupColors.groupD;
            case YELLOW_ALERT:
                return groupColors.groupC;
            case A:
                return groupColors.groupA;
            case B:
                return groupColors.groupB;
            case C:
                return groupColors.groupC;
            case D:
                return groupColors.groupD;
            default:
                return groupColors.groupGrey;
        }
    }

    getColoredIconsWithLabels() {
        const {group} = this.props;
        if (!group) return [null, null, null];
        let icon;
        let color;
        let label;
        switch (group) {
            case RED_ALERT:
                color = this.getIconColor(RED_ALERT);
                icon = <NotificationsActive fontSize='large' style={{color}}/>;
                label = groupNames[RED_ALERT];
                break;
            case YELLOW_ALERT:
                color = this.getIconColor(YELLOW_ALERT);
                icon = <NotificationsActive fontSize='large' style={{color}}/>;
                label = groupNames[YELLOW_ALERT];
                break;
            case A:
                color = this.getIconColor(A);
                icon = this.getSquaresIcon(color, 1, 3);
                label = groupNames[A];
                break;
            case B:
                color = this.getIconColor(B);
                icon = this.getSquaresIcon(color, 2, 2);
                label = groupNames[B];
                break;
            case C:
                color = this.getIconColor(C);
                icon = this.getSquaresIcon(color, 3, 1);
                label = groupNames[C];
                break;
            case D:
                color = this.getIconColor(D);
                icon = this.getSquaresIcon(color, 4, 0);
                label = groupNames[D];
                break;
            default: // CLOSED
                color = groupColors.groupGrey;
                icon = this.getSquaresIcon(color, 0, 0);
                label = '-';
        }
        return [icon, label, <RssFeed style={{color}}/>];
    }



    render() {
        const {classes, showLabels, reported} = this.props;
        const [icon, label, reportedIcon] = this.getColoredIconsWithLabels();
        return (<Grid container alignItems='center'>
            { showLabels ?
                <Grid item className={classes.spaceBetween}>
                    <IconTextGrid icon={icon} text={label}/>
                </Grid> :
                icon
            }
            {
                reported &&
                (showLabels ?
                    <Grid item>
                        <IconTextGrid icon={reportedIcon} text={'Reportado a autoridad'}/>
                    </Grid> :
                    reportedIcon)
            }
        </Grid>)
    }
}

export default withStyles(styles)(TicketTypeIcon);


