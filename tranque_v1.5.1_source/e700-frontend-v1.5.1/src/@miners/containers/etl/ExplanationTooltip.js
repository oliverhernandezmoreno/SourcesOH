import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import {
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@material-ui/core';
import {Close, TableChart} from '@material-ui/icons';

import SubscribedComponent from '@app/components/utils/SubscribedComponent';
import * as etlService from '@app/services/backend/etl';

const textColor = "#000000";

const styles = (theme) => ({
    root: {
        backgroundColor: "#ffffff",
        color: textColor,
        minWidth: "500px",
    },
    cell: {
        color: textColor
    },
    tableHeader: {
        color: textColor,
        whiteSpace: "nowrap"
    },
    caption: {
        color: `${theme.palette.grey[500]} !important`,
    },
    closeButton: {
        position: "absolute",
        right: theme.spacing(0.5),
        top: theme.spacing(0.5),
        color: theme.palette.grey[500]
    }
});

class ExplanationTooltip extends SubscribedComponent {

  state = {
      open: false,
      explanation: null
  };

  loadData() {
      const {operation} = this.props;
      this.subscribe(
          etlService.explain({
              target: operation.target,
              operation: operation.id,
              cache: 60 * 1000
          }),
          (explanation) => this.setState({explanation}),
      );
  }

  open = () => {
      this.setState({open: true});
      this.loadData();
  };

  close = () => {
      this.setState({open: false, explanation: null});
  };

  renderExplanation(steps) {
      if (steps.length === 0) {
          return <Typography>No hay información</Typography>;
      }
      const {classes} = this.props;
      return (
          <>
              {steps.map((tss, index) => (
                  <Table size="small" key={`table-${index}`}>
                      <caption className={classes.caption}>
                          {index === 0 ? 'Fin datos ingresados' : `Fin ciclo de cálculo ${index}`}
                      </caption>
                      <TableHead>
                          <TableRow>
                              <TableCell className={classes.caption} colSpan={2}>
                                  {index === 0 ? 'Datos ingresados' : `Ciclo de cálculo ${index}`}
                              </TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell className={classes.tableHeader}>Variable</TableCell>
                              <TableCell className={classes.tableHeader}>Valores</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {tss.map((ts, index) => (
                              <TableRow key={`row-${index}`}>
                                  <TableCell className={classes.cell}>{ts.name}</TableCell>
                                  <TableCell className={classes.cell}>{ts.events.map((e) => e.formattedValue).join('; ') || '<no hay información>'}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              ))}
          </>
      );
  }

  render() {
      const {classes} = this.props;
      return (
          <>
              <IconButton onClick={this.open} title="Ver detalle de cálculo">
                  <TableChart />
              </IconButton>
              <Dialog maxWidth="md" onClose={this.close} open={this.state.open}
                  PaperProps={{className: classes.root}}>
                  <DialogTitle disableTypography>
                      <Typography variant="h6">Detalle de cálculo</Typography>
                      <IconButton aria-label="Close" onClick={this.close} className={classes.closeButton}>
                          <Close />
                      </IconButton>
                  </DialogTitle>
                  <DialogContent>
                      {this.state.explanation === null ?
                          <CircularProgress /> :
                          this.renderExplanation(this.state.explanation)}
                  </DialogContent>
              </Dialog>
          </>
      );
  }
}

export default withStyles(styles)(ExplanationTooltip);
