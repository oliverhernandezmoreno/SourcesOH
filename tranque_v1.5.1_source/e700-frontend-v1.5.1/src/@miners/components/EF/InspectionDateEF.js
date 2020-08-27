import React from 'react';
// import PropTypes from 'prop-types';
// import {withStyles} from '@material-ui/core/styles';

// import history from '@app/history';
// import {reverse} from '@app/urls';

//import {forkJoin, of} from 'rxjs';
// import {sortByCategory} from '@app/services/backend/timeseries';

// import Button from '@material-ui/core/Button';
// import Typography from '@material-ui/core/Typography';
// import CircularProgress from '@material-ui/core/CircularProgress';
import SubscribedComponent from '@app/components/utils/SubscribedComponent';
// import AnswerTable from '@miners/components/EF/AnswerTable';
// import VoucherTable from '@miners/components/EF/VoucherTable';

// import * as EtlService from '@app/services/backend/etl';
import * as TimeseriesService from '@app/services/backend/timeseries';
//import * as etlService from '@app/services/backend/etl';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
//import moment from 'moment';

class Proof extends SubscribedComponent{

      state = {
          page: 1,
          pageSize: 15,
          operations: null,
          loadError: false
      }

      componentDidMount() {
          this.loadOperations();
      }

      loadOperations() {
          this.subscribe(
              TimeseriesService.read({
                  cache: 60 * 1000,
                  target: this.props.target,
                  canonical_name: this.props.timeseries.map(({canonical_name}) => canonical_name),
              }),
              (operations) =>
                  this.setState((state) =>
                      ({page: state.page, operations})), () => this.setState({loadError: true})
          );
      }
      render(){
          return(
              <div>
                  <div>
                      <Typography>Ingreso de datos vía excel</Typography>
                  </div>
                  <div>
                      <Table>
                          <TableHead>
                              <TableRow>
                                  <TableCell component="th">
                                    variables
                                  </TableCell>
                                  <TableCell component="th">
                                    Próximo ingreso
                                  </TableCell>
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {this.state.operations !== null ?
                                  this.state.operations.map((operation, index) => (
                                      <TableRow key={index}>
                                          <TableCell>
                                              <Typography>{operation.canonical_name}</Typography>
                                          </TableCell>
                                          {/*<TableCell>
                                              <Typography>{moment(operation.started).add(1,'M').format('lll')}</Typography>
                                          </TableCell>*/}
                                      </TableRow>
                                  )):null}
                          </TableBody>
                      </Table>
                  </div>
              </div>

          );
      }
}
export default Proof;
