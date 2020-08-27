import React from 'react';
import PropTypes from 'prop-types';
import {forkJoin, of} from 'rxjs';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import * as TemplatesService from '@app/services/backend/templates';
import * as TimeseriesService from '@app/services/backend/timeseries';
import {mergeMap} from 'rxjs/operators';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import history from '@app/history';
import {reverse} from '@app/urls';
import {EMAC} from '@miners/containers/EMAC/dashboard/constants';
import {ChipStatus} from '@miners/components/utils/ChipStatus';
import {ChipStatusLegend} from '@miners/components/utils/ChipStatusLegend';

const styles = theme => ({
    card: {
        backgroundColor: '#161719',
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    variablesList: {
        padding: '1rem 1rem 0 1rem',
        display: 'flex',
        flexWrap: 'wrap'
    },
    cardHeader: {
        display: 'flex',
        width: '100%',
        '&:not(:first-child)': {
            marginTop: theme.spacing(2)
        }
    },
    progress: {
        color: 'white',
        marginLeft: '1rem'
    }
});

class EMACTendencies extends SubscribedComponent {

  state = {
      variables: [],
      sgt: [],
      noPrediction: [],
      loading: false
  };

  statusNameForTemplate = (t) => `emac-mvp.adt.status.${t.slice('emac-mvp.'.length)}`;

  accumulateStatus = (fromList, toList, notFound) => (template) => {
      const ts = fromList.find((t) => t.template_name === this.statusNameForTemplate(template.canonical_name));
      if (!ts) {
          notFound.push({...template, _extra: {status: 'na'}});
      } else {
          const event = ts.events[0];
          if (!event) {
              notFound.push({...template, _extra: {status: 'na'}});
          } else if (event.value === 0) {
              toList.push({...template, _extra: {status: 'ok'}});
          } else if (event.value === -1) {
              toList.push({...template, _extra: {status: 'nodata'}});
          } else if (event.value === 1) {
              toList.push({...template, _extra: {status: 'warning'}});
          } else {
              toList.push({...template, _extra: {status: 'na'}});
          }
      }
  };

  loadData() {
      const {target} = this.props;
      this.unsubscribeAll();
      this.setState({variables: [], sgt: [], loading: true});
      const sources = this.props.sources.map(ds => ds.canonical_name).join(',');
      
      if (sources) {
          this.subscribe(
              forkJoin({
                  variables: TemplatesService.list({category: EMAC.templateVariables}),
                  sgt: TemplatesService.list({category: EMAC.templateSgt})
              }).pipe(
                  mergeMap(({variables, sgt}) => {
                      const variablesMap = variables.reduce(
                          (keyed, variable) => ({...keyed, [variable.canonical_name]: variable}),
                          {},
                      );
                      const sgtMap = sgt.reduce(
                          (keyed, variable) => ({...keyed, [variable.canonical_name]: variable}),
                          {},
                      );
                      if (variables.length > 0) {
                          return forkJoin({
                              variablesMap: of(variablesMap),
                              sgtMap: of(sgtMap),
                              _variables: TimeseriesService.list({
                                  target,
                                  template_name: variables
                                      .map(({canonical_name}) => canonical_name)
                                      .map(this.statusNameForTemplate)
                                      .join(','),
                                  max_events: 1,
                              }),
                              _sgt: TimeseriesService.list({
                                  target,
                                  template_name: sgt
                                      .map(({canonical_name}) => canonical_name)
                                      .map(this.statusNameForTemplate)
                                      .join(','),
                                  max_events: 1,
                              })
                          });
                      }
                      return of({variablesMap, sgtMap, _variables: [], _sgt: []});
                  })
              ),
              ({variablesMap, sgtMap, _variables, _sgt}) => {
                  const noPrediction = [];
                  const variables = [];
                  const sgt = [];
                  Object.values(variablesMap)
                      .forEach(this.accumulateStatus(_variables, variables, noPrediction));
                  Object.values(sgtMap)
                      .forEach(this.accumulateStatus(_sgt, sgt, noPrediction));
                  variables.sort(TimeseriesService.sortByDescription);
                  sgt.sort(TimeseriesService.sortByDescription);
                  noPrediction.sort(TimeseriesService.sortByDescription);
                  this.setState({variables, sgt, noPrediction, loading: false});
              }
          );
      } else {
          this.setState({loading: false});
      }
  }

  componentDidMount() {
      this.loadData();
  }

  componentDidUpdate(prevProps) {
      if (prevProps.sources !== this.props.sources) {
          this.loadData();
      }
  }

  onVariableSelect(template) {
      return () => {
          history.push(
              reverse(
                  'miners.target.emac.data.raw.byVariable',
                  {target: this.props.target},
                  {template: template.canonical_name, predictions: true, showNorms: true}
              )
          );
      };
  }

  getVariableChip(template) {
      const status = (template._extra || {status: 'na'}).status || 'na';
      return <ChipStatus
          key={template.canonical_name}
          status={status}
          text={template.description}
          onClick={this.onVariableSelect(template)}
      />;
  }

  render() {
      const {classes} = this.props;
      const {variables, sgt, noPrediction} = this.state;
      const loading = this.props.loading || this.state.loading;
      const noVariable = <Typography variant='caption'>
            No existen tendencias para este grupo de variables
      </Typography>;
      return (
          <>
              <div className={classes.card}>
                  <div className={classes.cardHeader}>
                      <Typography variant='body1'>
                            Variables reportadas por laboratorio
                      </Typography>
                  </div>
                  <div className={classes.variablesList}>
                      {loading && <CircularProgress className={classes.progress}/>}
                      {variables.map(t => this.getVariableChip(t))}
                      {!loading && variables.length === 0 && noVariable}
                  </div>
                  <div className={classes.cardHeader}>
                      <Typography variant='body1'>
                            Variables monitoreadas con sensores
                      </Typography>
                  </div>
                  <div className={classes.variablesList}>
                      {loading && <CircularProgress className={classes.progress}/>}
                      {sgt.map(t => this.getVariableChip(t))}
                      {!loading && sgt.length === 0 && noVariable}
                  </div>
              </div>
              {noPrediction.length > 0 && <div className={classes.card}>
                  <div className={classes.cardHeader}>
                      <Typography variant='body1'>
                            Variables sin tendencia disponible
                      </Typography>
                  </div>
                  <div className={classes.variablesList}>
                      {loading && <CircularProgress className={classes.progress}/>}
                      {noPrediction.map(t => this.getVariableChip(t))}
                  </div>
              </div>}
              <ChipStatusLegend
                  options={[
                      {status: 'warning', text: 'La tendencia excede algún valor de referencia'},
                      {status: 'ok', text: 'La tendencia no excede ningún valor de referencia'},
                      {status: 'nodata', text: 'La variable no posee valores de referencia'},
                      {status: 'na', text: 'Sin suficientes datos disponibles para calcular tendencia'}
                  ]}
              />
          </>
      );
  }
}

EMACTendencies.propTypes = {
    target: PropTypes.string.isRequired,
    sources: PropTypes.array.isRequired,
    loading: PropTypes.bool
};

export default withStyles(styles)(EMACTendencies);
