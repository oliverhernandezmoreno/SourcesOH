import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

import history from '@app/history';
import {reverse} from '@app/urls';

import {forkJoin, of} from 'rxjs';
import {sortByCategory} from '@app/services/backend/timeseries';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import AnswerTable from '@miners/components/EF/AnswerTable';
import VoucherTable from '@miners/components/EF/VoucherTable';

import * as EtlService from '@app/services/backend/etl';
import * as TimeseriesService from '@app/services/backend/timeseries';

const styles = theme => ({

    footer: {
        height: '110px'
    },

    textButton:{
        color: '#FFFFFF',
    },

    buttonFooter:{
        backgroundColor:'#1A76D1'
    },

    loadingContainer: {
        textAlign: 'center'
    },

    loading: {
        color: 'white',
        marginTop: '1rem'
    },
});


class Voucher extends SubscribedComponent {

  state = {
      operationObject: null,
      data: null,
      timeseries: null
  }

  componentDidMount() {
      this.loadData()
  }

  fetchTimeseries({executor}) {
      const {target} = this.props;
      switch (executor) {
          case "direct:triggers-and-design":
              return forkJoin([
                  TimeseriesService.list({target, template_category: 'm1-design'}),
                  TimeseriesService.list({target, template_category: 'm1-triggers'}),
                  TimeseriesService.list({target, template_category: 'm1-important-triggers'}),
                  TimeseriesService.list({target, template_category: 'm1-critical-triggers'}),
                  TimeseriesService.list({target, template_category: 'm1-forecasts-triggers'}),
              ]);
          case "direct:vulnerability":
              return forkJoin([
                  TimeseriesService.list({target, template_category: 'm1-vulnerability'})
              ]);
          default:
              return of([]);
      }
  }

  loadData = () => {
      const {target, operation} = this.props;
      this.subscribe(forkJoin({
          operationObject: EtlService.read({target, operation}),
          data: EtlService.data({target, operation}),
      }),
      ({operationObject, data}) => this.subscribe(
          this.fetchTimeseries(operationObject),
          (nestedTimeseries) => this.setState({
              operationObject,
              data,
              timeseries: nestedTimeseries.reduce((flat, nested) => [...flat, ...nested], [])
          })
      )
      );
  }

  renderMonthlyTables() {
      const tag = "m1-vulnerability-final-question";
      const partitions = [
          true,
          false,
      ]
          .map(
              (presence) => this.state.timeseries
                  .filter((ts) => (ts.category.indexOf(tag) !== -1) === presence)
          )
          .map((partition) => {
              return {
                  answers: this.state.data
                      .filter((answer) => partition.findIndex(
                          (ts) => ts.canonical_name === answer.series.canonical_name) !== -1
                      )
                      .map((answer) => [answer.series.canonical_name, `${parseInt(answer.value)}`])
                      .reduce((acc, [key, value]) => ({...acc, [key]: value}), {}),
                  items: sortByCategory(partition),
              }
          });
      const [finalQuestion, rest] = partitions;
      const{target,classes}= this.props;
      return (
          <div>
              <div>
                  <VoucherTable
                      items={this.state.operationObject}
                      group={'Datos del comprobante'}/>
                  <AnswerTable
                      items={finalQuestion.items}
                      answers={finalQuestion.answers}
                      group ={"Funcionamiento"}
                      daily={false}/>
                  <AnswerTable
                      items={rest.items}
                      answers={rest.answers}
                      group ={"Vulnerabilidad"}
                      daily={false}/>
              </div>
              <div className={classes.footer}>
                  <div className={classes.subFooter}>
                      <Button
                          variant="contained"
                          onClick={() => history.push(reverse(`authorities.target.data.ef.inspections.registry`, {
                              target
                          }))}
                          className={classes.buttonFooter}>
                          <Typography className={classes.textButton}>Ver registros</Typography>
                      </Button>
                  </div>
              </div>
          </div>
      )
  }

  renderDailyTables() {
      const{target,classes}= this.props;
      const partitions = [
          "m1-critical-triggers",
          "m1-important-triggers",
          "m1-triggers",
          "m1-forecasts-triggers",
          "m1-design"
      ]
          .map((tag) => this.state.timeseries.filter((ts) => ts.category.indexOf(tag) !== -1))
          .map((partition) => {
              return {
                  answers: this.state.data
                      .filter((answer) => partition.findIndex(
                          (ts) => ts.canonical_name === answer.series.canonical_name) !== -1
                      )
                      .map((answer) => [answer.series.canonical_name, !!parseInt(answer.value)])
                      .reduce((acc, [key, value]) => ({...acc, [key]: value}), {}),
                  items: sortByCategory(partition),
              }
          });
      const [critical, important, triggers, forecasts, design] = partitions;
      return (
          <div>
              <div>
                  <VoucherTable
                      items={this.state.operationObject}
                      group={'Datos del comprobante'}/>
                  <AnswerTable
                      items={critical.items}
                      answers={critical.answers}
                      group ={"eventos críticos"}
                      daily={true}/>
                  <AnswerTable
                      items={important.items}
                      answers={important.answers}
                      group ={"eventos importantes"}
                      daily={true}/>
                  <AnswerTable
                      items={triggers.items}
                      answers={triggers.answers}
                      group ={"eventos"}
                      daily={true}/>
                  <AnswerTable
                      items={forecasts.items}
                      answers={forecasts.answers}
                      group ={"pronóstico climatológico"}
                      daily={true}/>
                  <AnswerTable
                      items={design.items}
                      answers={design.answers}
                      group ={"diseño"}
                      daily={true}/>
              </div>
              <div className={classes.footer}>
                  <div className={classes.subFooter}>
                      <Button
                          variant="contained"
                          onClick={() => history.push(reverse(`authorities.target.data.ef.inspections.registry`, {
                              target
                          }))}
                          className={classes.buttonFooter}>
                          <Typography className={classes.textButton}>Ver registros</Typography>
                      </Button>
                  </div>
              </div>
          </div>
      )
  }

  renderLoading() {
      const{classes}=this.props;
      return <div className={classes.loadingContainer}>
          <CircularProgress className={classes.loading}/>
      </div>

  }

  render() {
      if (this.state.data === null) {
          return this.renderLoading();
      }
      const operation = this.state.operationObject;
      if (operation && operation.executor === "direct:triggers-and-design") {
          return this.renderDailyTables();
      }
      if (operation && operation.executor === "direct:vulnerability") {
          return this.renderMonthlyTables();
      }
      return <p>Ocurrió un error inesperado; inténtelo más tarde</p>;
  }
}

Voucher.propTypes = {
    classes: PropTypes.object.isRequired,
    loading: PropTypes.bool
};

export default withStyles(styles)(Voucher);
