import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import TMaterialTable from '@app/components/utils/TMaterialTable';
import TSelect from '@app/components/utils/TSelect';
import * as moment from 'moment';
import {ISO_DATE_FORMAT} from '@app/config';
import {Link} from 'react-router-dom';
import {reverse} from '@app/urls';
import {getDateSortNumber} from '@app/services/sorting';
import {Button, Container, Typography, Grid} from '@material-ui/core';
import {Cancel,
    CancelScheduleSend,
    CheckCircleOutline,
    DoneAll,
    Done,
    Edit,
    HourglassEmpty,
    HourglassFull,
    Save,
    SkipNext,
    SkipPrevious} from '@material-ui/icons';
import {trimesters} from '@e700/utils/trimesterSelectItems';
import GetNewForm from '@e700/components/instance/GetNewForm';
import TSymbology from '@e700/components/instance/TSymbology';
import theme from '@e700/theme';

const styles = theme => ({
    root: {
        width: '100%'
    },
    header: {
        padding: theme.spacing(2.75)
    },
    title: {
        fontWeight: 'bold'
    },
    toolbar: {
        [theme.breakpoints.up('md')]: {
            paddingLeft: '0px'
        },
        [theme.breakpoints.up('sm')]: {
            paddingLeft: '0px'
        },
        paddingLeft: '0px',
        width: '100%'
    },
    toolbarPadding: {
        paddingTop: 20
    },
    toolbarFilter: {
        alignItems: 'left',
    },
});

const MSG_TO_ICON = {
    'open': <Edit/>,
    'started': <Save/>,
    'completed': <CancelScheduleSend/>,
    'new_sent': <Done/>,
    'answer_to_validate': <HourglassEmpty/>,
    'answer_validated': <HourglassFull/>,
    'answer_sending': <CancelScheduleSend/>,
    'answer_sent': <Done/>,
    'answer_received': <Done/>,
    'answer_reviewed': <DoneAll/>,
    'new_sending': <CancelScheduleSend/>,
    'created': <SkipNext/>,
    'rejected': <Cancel/>,
    'accepted': <CheckCircleOutline/>,
    'answer_to_check': <SkipPrevious/>
};


function getStateMsg(instance) {
    let state = '';
    if (instance.state === 'open' && instance.answer_count > 0) {
        if (instance.answer_count === instance.form_field_count) {
            state = 'completed';
        }
        else if (instance.reason.length > 0) {
            state = 'answer_to_check';
        }
        else state = 'started';
    }
    else if (instance.form_requests.length > 0) {
        state = instance.form_requests[0].state;
    }
    else state = instance.state;
    return <Typography style={{color: '#ffffff'}}>
        {MSG_TO_ICON[state]}
    </Typography>;
}

function buttonText(state) {
    if (state === 'open') {
        return 'Llenar formulario';
    }
    else {
        return 'Ver formulario';
    }
}

function instanceToTableRow(instance, target_canonical_name) {
    const btnText = buttonText(instance.state);

    return {
        period: instance.period,
        state: getStateMsg(instance),
        button: (
            <Button
                style={{width: '220px', whiteSpace: 'nowrap', color: '#ffffff', backgroundColor: '#1A76D1'}}
                variant="contained"
                component={Link} to={reverse('e700.form', {target_canonical_name: target_canonical_name,
                    id: instance.id})
                }>
                <Typography style={{textTransform: 'capitalize'}}>{btnText}</Typography>
            </Button>
        ),
        sent: instance.sent_at,
        received: instance.received_at
    };
}

class FormInstanceList extends Component {
  state = {
      selectedYear: '',
      trimesters: [],
      selectedTrimester: ''
  };

  getYears() {
      let years = new Set([]);
      this.props.instances.forEach((instance) => {
          years.add(instance.year)
      });
      return Array.from(years)
          .slice().sort((a, b) => b - a)
          .map((year) => {return {label: year, value: year};});
  }

  onYearChange(value) {
      let trimesterItems = [];
      if (value !== '') trimesterItems = trimesters;
      this.setState({selectedYear: value,
          selectedTrimester: '',
          trimesters: trimesterItems});
  }

  onTrimestreChange(value) {
      this.setState({selectedTrimester: value});
  }

  onRequestCreate = (newRequest, id) => {
      if (this.props.onRequestCreate) {
          this.props.onRequestCreate(newRequest, id);
      }
  };

  renderFilters() {
      const padding = {paddingBottom: '18px', paddingLeft: '30px'}
      return (<Grid container justify='center' alignItems="flex-end">
          <Grid item style={{...padding, minWidth: 100}}>
              <TSelect
                  field='Año'
                  defaultValue='Todos los años'
                  menuItems={this.getYears()}
                  onChange={(event) => this.onYearChange(event.target.value)}
                  selected={this.state.selectedYear}/>
          </Grid>
          <Grid item style={{...padding, minWidth: 200}}>
              <TSelect
                  field='Trimestre'
                  defaultValue='Todos los trimestres'
                  menuItems={this.state.trimesters}
                  disabled={this.state.trimesters.length === 0}
                  onChange={(event) => this.onTrimestreChange(event.target.value)}
                  selected={this.state.selectedTrimester}/>
          </Grid>
      </Grid>
      );
  }



  render() {
      const {classes, target, loading, instances} = this.props;
      let entity = 'cargando...';
      let faena = 'cargando...';
      if (target.work_sites !== undefined) {
          if (target.work_sites.length > 0) {
              faena = target.work_sites[0].name;
              if (target.work_sites[0].entity) {
                  entity = target.work_sites[0].entity.name;
              } else {
                  entity = '(sin faena)';
              }
          } else {
              entity = '(sin empresa)';
              faena = '(sin faena)';
          }
      }

      let table;
      if (loading) {
          table = <Typography>cargando...</Typography>;
      } else {
          const tableColumns = [
              {
                  title: <Typography variant="body2">Período</Typography>,
                  field: 'period'
              },
              {
                  title: <Typography variant="body2">Fecha de envío por la empresa</Typography>,
                  field: 'sent',
                  render: data => data.sent ? moment(data.sent).format(ISO_DATE_FORMAT) : 'Pendiente',
                  customSort: (data1, data2) => getDateSortNumber(data1.sent, data2.sent)
              },
              {
                  title: <Typography variant="body2">Fecha de recepción por SNGM</Typography>,
                  field: 'received',
                  render: data => data.received ? moment(data.received).format(ISO_DATE_FORMAT) : 'No recibido aún',
                  customSort: (data1, data2) => getDateSortNumber(data1.received, data2.received)
              },
              {
                  title: <Typography variant="body2">Estado</Typography>,
                  field: 'state',
                  sorting: false
              },
              {
                  field: 'button',
                  sorting: false
              }
          ];
          const _instances = instances.slice();
          _instances.sort((a, b) => b.period.localeCompare(a.period));
          const tableData = _instances.filter((instance) => {
              return ((this.state.selectedYear === '' || this.state.selectedYear === instance.year) &&
                   (this.state.selectedTrimester === '' || this.state.selectedTrimester === instance.trimester));
          }).map((ins) => instanceToTableRow(ins, target.canonical_name));

          table = (
              <TMaterialTable
                  data={tableData}
                  columns={tableColumns}
                  options={{search: false,
                      headerStyle: { fontWeight: 'bold',
                          backgroundColor: theme.palette.primary.main,
                          color: '#ffffff' }}}
                  components={{
                      Toolbar: props => (<>
                          <Grid container justify='space-between' className={classes.toolbarPadding}>
                              <Grid item>
                                  <Typography variant="h6" className={classes.title}>{target.name} - {faena}</Typography>
                              </Grid>
                              <Grid item>
                                  <GetNewForm
                                      instances={instances}
                                      onCreate={this.onRequestCreate}
                                  />
                              </Grid>
                          </Grid>
                          <Grid container justify='space-between' className={classes.toolbarPadding}>
                              <Grid item>
                                  {this.renderFilters()}
                              </Grid>
                              <Grid item>
                                  <TSymbology/>
                              </Grid>
                          </Grid>
                      </>)
                  }}
                  localization={{body: {emptyDataSourceMessage: 'No se encontraron instancias de formulario E700'}}}
              />
          );
      }

      return (
          <div className={classes.root}>
              <Container className={classes.header} maxWidth="lg">
                  <Typography>{entity}</Typography>
                  <Typography variant="h6" className={classes.title}>Estado de envío de formulario E700</Typography>
              </Container>
              <Container maxWidth="lg">
                  {table}
              </Container>
          </div>
      );
  }
}


export default withStyles(styles)(FormInstanceList);
