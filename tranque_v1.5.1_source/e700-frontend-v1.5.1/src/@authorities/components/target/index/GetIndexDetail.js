import React, {Component} from 'react';

import {formatDecimal} from '@app/services/formatters';
import TMaterialTable from '@app/components/utils/TMaterialTable';
import theme from '@authorities/theme';
import moment from 'moment';

class GetIndexDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            itemsShowed: 10,
            currentPage: 0,
        };
    }

  handleChangeRowsPerPage = (pageSize) => {
      this.setState({itemsShowed: pageSize});
  };

  handleChangePage = (page) => {
      this.setState({currentPage: page});
  };


  getThresholdLower(thresholds) {
      const {templateName} = this.props;
      // the first check for the second doesn't fail if not this defined thresholds
      if (!thresholds || thresholds.length === 0) {
          return '--';
      }
      // finds the first element that satisfies the condition
      const thresh = thresholds.find(t => templateName.includes(t.kind))
      // if any element exists and has lower value, returns it
      if (thresh && thresh.lower !== null){
          return formatDecimal(parseFloat(thresh.lower), 4);
      }else{
          return '--';
      }
  }

  getThresholdUpper(thresholds){
      const {templateName} = this.props;
      if (!thresholds || thresholds.length === 0) {
          return '--';
      }
      const thresh = thresholds.find(t => templateName.includes(t.kind))
      if (thresh && thresh.upper !== null){
          return formatDecimal(parseFloat(thresh.upper), 4);
      }else{
          return '--';
      }
  };

  isExpectedValue(value, lower, upper){
      //TODO: '--' for now
      if (lower === '--' && upper === '--'){
          return true;
      }
      if (lower === '--' && parseFloat(value) < upper){
          return true;
      }
      if (upper === '--' && parseFloat(value) > lower){
          return true;
      }

      return parseFloat(value) > lower && value < upper;
  }

  render(){
      const {trace} = this.props;
      const columns =
        [
            { title: 'Agrupación', field: 'group' },
            { title: 'Variable', field: 'variable' },
            { title: 'Límite inferior', field: 'lower_th' },
            { title: 'Límite superior', field: 'upper_th' },
            { title: 'Fecha de medición', field: 'date' },
            { title: 'Valor', field: 'value' }
        ];
      let data1 = [];
      let data2 = [];
      trace.map((t) => {
          const filterRow = {
              group: t.data_source_name ? t.data_source_name : '--',
              variable: t.description ? t.description : '--',
              lower_th: this.getThresholdLower(t.thresholds),
              upper_th: this.getThresholdUpper(t.thresholds),
              date: t.events.length > 0 ? moment(t.events[0]['@timestamp']).format('DD-MM-YYYY HH:mm') : '--',
              value: t.events.length > 0 ? formatDecimal(t.events[0].value, 4) : '--'
          }

          //row within the expected
          if (this.isExpectedValue(filterRow.value, filterRow.lower_th, filterRow.upper_th)){
              data2.push(filterRow);
          }
          //row exceed threshold
          else{
              data1.push(filterRow);
          }

          return filterRow;
      });

      return (
          <div>
              <TMaterialTable
                  title={'Variables que excedieron un valor de referencia o umbral'}
                  data={data1}
                  columns={columns}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  onChangePage={this.handleChangePage}
                  options={{sorting: false, search: false,
                      headerStyle: { fontWeight: 'bold',
                          backgroundColor: theme.palette.primary.main,
                          color: theme.palette.secondary.light },
                      exportButton: true}}
                  localization={{
                      body: {emptyDataSourceMessage: 'No hay datos disponibles'}
                  }}
              />
              <TMaterialTable
                  title={'Variables dentro de lo esperado'}
                  data={data2}
                  columns={columns}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  onChangePage={this.handleChangePage}
                  options={{sorting: false, search: false,
                      headerStyle: { fontWeight: 'bold',
                          backgroundColor: theme.palette.primary.main,
                          color: theme.palette.secondary.light},
                      exportButton: true }}
                  localization={{
                      body: {emptyDataSourceMessage: 'No hay datos disponibles'}
                  }}
              />
          </div>
      );
  }
}

export default GetIndexDetail;
