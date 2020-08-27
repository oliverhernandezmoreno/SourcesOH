import React, { Component } from 'react';
import VegaLegendMiniPlot from '@app/components/charts/VegaLegendMiniPlot.js'
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const StyledCheckbox = withStyles((theme) => {
    return ({
        root: {
            color: 'white',
            '&$checked': {
                color: 'white',
            },
        },
        checked: {},
    })
})((props) => <Checkbox color="default" {...props} />);


const styles = theme => ({

    innerCard: {
        maxWidth: '100%',
        maxHeight: '100%'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: (props) => {
            if (props.transposed) {
                if (props.getColumnLabels) {
                    return `${props.getRowGroupLabel ? 'max-content ' : ''} repeat(${props.metaData.length}, max-content)`;
                }
                return;
            }
            if (props.getColumnLabels) {
                return `${props.getRowGroupLabel ? 'max-content ' : ''}${'minmax(100px, max-content) '.repeat(props.getColumnLabels(props.metaData).filter(f => f !== null).length)}`;
            }
            return 'max-content';
        },
        gridTemplateRows: (props) => {
            if (!props.transposed) return;
            if (props.getColumnLabels) {
                return `${props.getRowGroupLabel ? 'max-content ' : ''}${' max-content'.repeat(props.getColumnLabels(props.metaData).filter(f => f !== null).length)}`;
            }
            return 'max-content';
        },
        paddingBottom: '2em',
        gridGap: '0.3em',
        gridAutoFlow: (props) => props.transposed ? 'column' : 'row',
        overflowX: 'scroll',
        "&::-webkit-scrollbar": {
            height: "1em",
            // background: "none",
        },

        /* Track */
        "&::-webkit-scrollbar-track": {
            background: "none"
        },

        /* Handle */
        "&::-webkit-scrollbar-thumb": {
            background: "#303030",
            borderRadius: "0.5em",
        },

        /* Handle on hover */
        "&::-webkit-scrollbar-thumb:hover": {
            background: "#656565"
        },
        /* Hover on grid */
        "&:hover::-webkit-scrollbar-thumb": {
            background: "#656565"
        }
    },
    paper: {
        // display: 'flex',
        // justifyContent: 'flex-start',
        // alignItems: 'center',
        backgroundColor: '#303030',
    },
    sector: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '0 1em',
        maxWidth: '24ch',
        textAlign: 'end'
    },
    header: {
        justifyContent: 'flex-end',
    },
    profile: {
        margin: '0',
        paddingRight: '9px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profileLabel: {
        marginRight: '0.5em',
    },
    labelOnly: {
        color: 'rgba(255, 255, 255, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        maxWidth: '21ch',
        padding: '1em'
    }
});

class GraphicSelector extends Component {

    static defaultProps = {
        transposed: false
    }

    static propTypes = {
        /**
         * Whether to render the table swapping rows by columns.
         * Defaults to true since it endeded up being the main use case.
         *
         * If false it will be rendered like
         *          col_label1     col_label2
         * sector1  cell1.1         cell1.2
         * sector1  cell2.1         cell2.2
         * sector2  cell3.1         cell3.2
         * sector2  cell4.1         cell4.2
         * If true the table will be rendered like:
         *              sector1 sector1 sector2 sector2
         * col_label1   cell1.1 cell2.1 cell3.1 cell4.1
         * col_label2   cell1.2 cell2.2 cell3.2 cell4.2
         */
        transposed: PropTypes.bool
    }

    renderHeaders = () => {
        const { classes } = this.props;
        return <React.Fragment>
            {/* If  grouplabels, fill header with empty cell*/}
            {this.props.getRowGroupLabel && <span></span>}
            {
                this.props.getColumnLabels(this.props.metaData).filter(f => f !== null).map((label, index) => {
                    return <React.Fragment key={`t-${index}`}>
                        <Typography variant="body1" component="p" className={[classes.sector, classes.header].join(' ')}>
                            {label}
                        </Typography>
                    </React.Fragment>
                })
            }
        </React.Fragment>
    }

    render() {
        const { classes } = this.props;
        // const rowGroupLabel = seriesMetadata.data_source?.group_names[1];
        const columnLabels = this.props.getColumnLabels(this.props.metaData).filter(f => f !== null);
        return (
            <div className={classes.innerCard}>
                <div className={classes.grid}>
                    {this.renderHeaders()}
                    {
                        this.props.metaData.map((row, rowIndex) => {
                            const rowGroupLabel = this.props.getRowGroupLabel(row, rowIndex);
                            const rowLabels = this.props.getRowLabels(row, rowIndex);
                            return (
                                <React.Fragment key={rowIndex}>
                                    <Typography variant="body1" component="p" className={classes.sector}>
                                        {rowGroupLabel}
                                    </Typography>
                                    {
                                        columnLabels.map((columnLabel, index) => {
                                            const lineProperties = this.props.linesStyles?.[rowIndex]?.[index];
                                            if (!lineProperties) return null;;
                                            const isAvailable = this.props.availableNames.includes(lineProperties.name);
                                            const DefaultContainer = ({ children, ...props }) => {
                                                return <Paper {...props} className={lineProperties.className}>{children}</Paper>
                                            };
                                            const Container = lineProperties.Container || DefaultContainer;
                                            return (
                                                <Container key={index}>
                                                    {!lineProperties.labelOnly && (<FormControlLabel
                                                        value="end"
                                                        control={
                                                            <StyledCheckbox
                                                                color="default"
                                                                checked={!this.props.hiddenData[lineProperties.name] && isAvailable}
                                                                onChange={() => this.props.toggleSeries(lineProperties.name)}
                                                                disabled={!isAvailable}
                                                                indeterminate={!isAvailable} />
                                                        }
                                                        label={(
                                                            <>
                                                                <span className={classes.profileLabel}>{rowLabels?.[index] ?? ''}</span>
                                                                <VegaLegendMiniPlot
                                                                    color={lineProperties?.color}
                                                                    shape={lineProperties?.shape}
                                                                    filled={lineProperties?.filled}
                                                                    dash={lineProperties?.dash}
                                                                    markType={lineProperties?.markType}
                                                                />

                                                            </>)}
                                                        labelPlacement="end"
                                                        className={classes.profile}
                                                    />)}
                                                    {lineProperties.labelOnly && (
                                                        // <span className={classes.profileLabel}>{rowLabels?.[index] ?? ''}</span>
                                                        <Typography variant="body1" component="p" className={classes.labelOnly}>
                                                            {rowLabels?.[index] ?? ''}
                                                        </Typography>)
                                                    }
                                                </Container>)
                                        })
                                    }
                                </React.Fragment>)
                        })
                    }
                </div>
            </div >
        );
    }
}

GraphicSelector.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(GraphicSelector);
