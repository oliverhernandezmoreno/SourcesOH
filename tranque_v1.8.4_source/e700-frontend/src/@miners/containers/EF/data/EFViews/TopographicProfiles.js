import React from 'react';
import moment from 'moment/moment';
import Card from '@material-ui/core/Card';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SelectableTimeseries from './DefaultTemporalView/SelectableTimeseries';
import { connect } from 'react-redux';
import * as TimeseriesService from '@app/services/backend/timeseries';
import * as SiteParameterService from '@app/services/backend/siteParameter';
import Typography from '@material-ui/core/Typography';
import AboutParameter from './DefaultTemporalView/AboutParameter'
import { getEFLabel } from '@miners/components/EF/EF.labels';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import EFFilter from '../EFFilters/EFFilter';

const styles = theme => ({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: '#303030',
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        margin: '30px',
        marginBottom: '0px'
    },
    title: {
        height: '100%',
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
    },
    content: {
        width: '100%',
        position: 'relative'
    },
    content__timeseries: {
        backgroundColor: '#262629',
        margin: '30px',
    },
});


class CardGraphicFilter extends SubscribedComponent {

    state = {
        dataLists: {},
        startDate: moment().subtract(2, 'year').startOf('day'),
        endDate: moment().endOf('day'),
        timeseriesData: {},
        metaDataDict: {},
        filters: {
            startDate: moment().subtract(2, 'year').startOf('day'),
            endDate: moment().endOf('day'),
            dateOne: moment().endOf('day'),
            dateTwo: moment().endOf('day'),
        },
        isLoading: true,
        hiddenLinesDict: {},
        description: [],
        siteParameters: {},
    };

    loadListSeries() {
        const { target } = this.props;
        this.setState({
            dataLists: [],
            isLoading: true,
        });
        const plotTemplates = this.props.sections;
        const metadataPromises = plotTemplates.flatMap(plotTemplate => {
            return plotTemplate.sources.flatMap((templateSourceName) => {
                return new Promise((resolve, reject) => {
                    this.subscribe(
                        TimeseriesService.list({
                            cache: 60 * 1000,  // one minute
                            target: target,
                            template_name: `ef-mvp.m2.parameters.${templateSourceName}`,
                            max_events: 1
                        }),

                        (ts) => {
                            // ts is a list, then is converted to a dict
                            // TODO is this justified?
                            const templateData = ts.map(ts => ({
                                name: ts.name.split('--')[1] || ts.name,
                                canonical_name: ts.canonical_name,
                                data_source: ts.data_source,
                                thresholds: ts.thresholds,
                                unit: ts.unit,
                                description: ts.description,
                            }));


                            // this.setState({
                            //     dataLists: {
                            //         ...this.state.dataLists,
                            //         [templateSourceName]: templateData
                            //     },
                            // });
                            resolve({
                                [templateSourceName]: templateData
                            });

                            this.loadSingleSeries(templateData, templateSourceName);
                        }
                    );
                });

            })
        });

        Promise.all(metadataPromises).then(values => {
            this.setState({
                description: values.map(el => {
                    const  obj = Object.values(el)?.[0]?.[0];
                    return obj?.name ? {name: obj?.name, description: obj?.description } : {};
                }).filter(el => el.description !== undefined),
                dataLists: values.reduce((acc, cur) => { return { ...acc, ...cur } }),
                isLoading: true,
            });
            this.reloadSeries();
        })
    }

    reloadSeries = () => {
        const { sections } = this.props;

        const plotTemplates = sections;
        const promises = plotTemplates.flatMap(plotTemplate => {
            return plotTemplate.sources.flatMap((templateSourceName) => {
                const templateData = this.state.dataLists[templateSourceName];
                return this.loadSingleSeries(templateData, templateSourceName);
            });
        });
        Promise.all(promises).then(values => {
            const dict = {};
            values.forEach(templateSourceNameDict => {
                const keys = Object.keys(templateSourceNameDict);
                const dictKeys = Object.keys(dict);
                keys.forEach(templateSourceName => {
                    if (dictKeys.includes(templateSourceName)) {
                        dict[templateSourceName] = {
                            ...dict[templateSourceName],
                            ...templateSourceNameDict[templateSourceName]
                        }
                    }
                    else {
                        dict[templateSourceName] = { ...templateSourceNameDict[templateSourceName] }
                    }
                })
            })
            this.setState({
                timeseriesData: dict,
                isLoading: false,
            });
        })
    }

    loadSingleSeries = (dataList, templateSourceName) => {
        const promises = dataList.flatMap((data) => {
            return this.loadSpatialSeries(data.canonical_name, templateSourceName);
        })
        return promises;
    }

    loadSpatialSeries = (serie_canonical_name, templateSourceName) => {

        if (!serie_canonical_name || serie_canonical_name === '' || !templateSourceName || templateSourceName === '') {
            return;
        }

        const decomposition_name = serie_canonical_name.split('.').pop();
        const var_name = getEFLabel(decomposition_name);


        // Load data with head endpoint
        const promises = [this.state.filters.dateOne, this.state.filters.dateTwo].map((date_to, index) => {
            return new Promise((resolve, reject) => {
                // clear only current ts
                // this.setState(timeseriesData => ({
                //     timeseriesData: {
                //         ...timeseriesData,
                //         [templateSourceName]: {
                //             ...timeseriesData[templateSourceName],
                //             [`${serie_canonical_name}-date-${index}`]: {}
                //         }
                //     },
                // }));
                this.subscribe(
                    TimeseriesService.head({
                        cache: 60 * 1000,  // one minute
                        target: this.props.target,
                        timeseries: serie_canonical_name,
                        date_to: date_to.format(),
                    }),
                    (ts) => {
                        // this.setState({
                        //     timeseriesData: {
                        //         ...this.state.timeseriesData,
                        //         [templateSourceName]: {
                        //             ...this.state.timeseriesData[templateSourceName],
                        //             [`${serie_canonical_name}-date-${index}`]: [{ label: `${var_name}`, data: ts }]
                        //         }
                        //     }
                        // });
                        resolve({
                            [templateSourceName]: {
                                [`${serie_canonical_name}-date-${index}`]: [{ label: `${var_name}`, data: ts }]
                            },
                        })
                    }
                );
            });
        });
        return promises;
    }

    getSiteParameters() {
        this.subscribe(
            SiteParameterService.get({v1: true}),
            data => {
                this.setState({siteParameters: data});
            }
        );
    }

    setFilters = (filters) => {
        this.setState({
            filters
        })
    }

    generateExportProps = (title, getRowGroupLabel, getRowLabels, getColumnLabels, getCellTimeSeriesName, metaData) => {
        const canonical_name = Array.from(new Set(metaData.flatMap(
            (row) => getColumnLabels(metaData)
                .map((colLabel, colIndex) => getCellTimeSeriesName(colLabel, colIndex, row))
                .filter((n) => !this.state.hiddenLinesDict[n])
                .map((name) => name.replace(/-date-\d+$/, ''))
        )));
        return {
            canonical_name,
            dateTo: moment(this.state.filters.dateOne).isValid() ? this.state.filters.dateOne : null,
            head: true
        };
    };

    componentDidMount() {
        this.loadListSeries();
        this.getSiteParameters();
    }

    componentDidUpdate(prevProps, prevState) {
        const templateChange = JSON.stringify(prevProps.template) !== JSON.stringify(this.props.template);
        if (templateChange) {
            this.loadListSeries();
        }

        if (prevState.filters !== this.state.filters) {
            const validTempDates = moment(this.props.endDate).isValid() && moment(this.props.startDate).isValid();
            const validCompDates = moment(this.props.dateOne).isValid() && moment(this.props.dateOne).isValid();
            if (validTempDates || validCompDates) {
                this.reloadSeries()
            }
        }
    }

    componentWillUnmount = () => {
        this.unsubscribeAll();
    }

    toggleSeries = (canonical_name) => {
        const hiddenLinesDict = { ...this.state.hiddenLinesDict };
        if (hiddenLinesDict[canonical_name] === undefined)
            hiddenLinesDict[canonical_name] = false;
        hiddenLinesDict[canonical_name] = !hiddenLinesDict[canonical_name];
        this.setState({
            hiddenLinesDict
        });
    }

    render() {
        const { classes, template, wikiLink } = this.props;
        const plotTemplates = this.props.sections;
        const filterType = plotTemplates?.[0]?.config?.filterType;//Improve checking first

        return (
            <div>
                <Card className={classes.root}>
                    <div className={classes.header}>
                        <div className={classes.title}>
                            <Typography variant='h5'>
                                {getEFLabel(template)}
                            </Typography>
                            <AboutParameter description={this.state.description} wikiLink={this.state.siteParameters[wikiLink]}></AboutParameter>
                        </div>
                        <EFFilter filterType={filterType} filters={this.state.filters} setFilters={this.setFilters} />
                    </div>

                    <div className={classes.content}>
                        {
                            plotTemplates.map(plotTemplate => {
                                let dataList = plotTemplate.sources.flatMap(template => this.state.dataLists[template] ?? []);
                                const metaDataDict = dataList.reduce((prevDict, series) => {
                                    const { canonical_name, ...data } = series;
                                    prevDict[canonical_name] = data;
                                    return prevDict;
                                }, {})
                                const metaData = plotTemplate.config.makeMetadata(metaDataDict);

                                const timeseriesData = plotTemplate.sources.reduce((prevDict, currentKey) => {
                                    if (!Object.keys(this.state.timeseriesData).includes(currentKey)) {
                                        return prevDict;
                                    }
                                    Object.entries(this.state.timeseriesData[currentKey]).forEach(([canonical_name, ts]) => {
                                        prevDict[canonical_name] = ts;
                                    });
                                    return prevDict;
                                }, {})


                                const horizontalLinesData = plotTemplate.config.getHorizontalLinesData ? plotTemplate.config.getHorizontalLinesData(metaData, timeseriesData) : [];

                                return (
                                    <Card className={classes.content__timeseries} key={plotTemplate.title}>
                                        <SelectableTimeseries
                                            title={plotTemplate.title}
                                            xAxisUnits={plotTemplate.config.xAxisUnits}
                                            xAxisTitle={plotTemplate.config.xAxisTitle}
                                            metaData={metaData}
                                            timeseriesData={timeseriesData}
                                            horizontalLinesData={horizontalLinesData}
                                            isTemporal={false}
                                            exportProps={this.generateExportProps(
                                                plotTemplate.title,
                                                plotTemplate.config.getRowGroupLabel,
                                                plotTemplate.config.getRowLabels,
                                                plotTemplate.config.getColumnLabels,
                                                plotTemplate.config.getCellTimeSeriesName,
                                                metaData
                                            )}
                                            makeMetadata={plotTemplate.config.makeMetadata}
                                            getRowGroupLabel={plotTemplate.config.getRowGroupLabel}
                                            getRowLabels={plotTemplate.config.getRowLabels}
                                            getColumnLabels={plotTemplate.config.getColumnLabels}
                                            getCellTimeSeriesName={plotTemplate.config.getCellTimeSeriesName}
                                            linesStylesModifier={plotTemplate.config.linesStylesModifier}
                                            isLoading={this.state.isLoading}
                                            hiddenLinesDict={this.state.hiddenLinesDict}
                                            toggleSeries={this.toggleSeries}
                                        />
                                    </Card>
                                )
                            })
                        }
                    </div>
                </Card>
            </div>
        );
    }
}

const MapStateToProps = state => {
    return {
        serieCanonicalName: state.miners.timeSeries.serie_canonical_name
    };
};

CardGraphicFilter.propTypes = {
    classes: PropTypes.object.isRequired
};

export default connect(MapStateToProps, null)(withStyles(styles)(CardGraphicFilter));
