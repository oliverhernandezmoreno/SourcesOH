import React from 'react';
import {connect} from 'react-redux';
import moment from 'moment/moment';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import Done from '@material-ui/icons/Done';
import Error from '@material-ui/icons/Error';

import {formatInteger, formatUsername} from '@app/services/formatters';
import DownloadDataFileButton from '@miners/containers/etl/DownloadDataFileButton';
import ExplanationTooltip from '@miners/containers/etl/ExplanationTooltip';

const BaseVoucher = ({operation, auth, children}) => {
    const success = operation.state === 'success';
    let errorLabel = 'La planilla de carga ya no está soportada por el sistema';
    if (operation.errors.length > 0 && operation.errors[0].code === 'parsing-error') {
        errorLabel = 'El archivo cargado no pudo ser leído correctamente';
    } else if (operation.errors.length > 0) {
        errorLabel = 'Hay errores en los datos del archivo cargado';
    } else if (operation.data_count === 0) {
        errorLabel = 'No se encontraron datos en el archivo cargado';
    }
    const rows = [
        {
            label: 'Inicio',
            cell: <Typography>{moment(operation.started).format('lll')}</Typography>,
        },
        operation.data_file
            ? {
                label: 'Archivo',
                cell: <DownloadDataFileButton dataFile={operation.data_file} />,
            }
            : null,
        {
            label: 'Usuario',
            cell: <Typography>{formatUsername(operation.user)}</Typography>,
        },
        operation.data_count > 0
            ? {
                label: 'Cantidad de datos',
                cell: <Typography>{formatInteger(operation.data_count)}</Typography>,
            }
            : null,
        success
            ? {
                label: 'Ingresado',
                cell: <Typography>{moment(operation.changed_state).format('lll')}</Typography>,
            }
            : {
                label: 'Error',
                cell: <Typography color="error">{errorLabel}</Typography>,
            },
        success && auth.user.groups.indexOf('analyst') !== -1
            ? {
                label: 'Detalle de cálculo',
                cell: <ExplanationTooltip operation={operation} />,
            }
            : null,
    ].filter((row) => row);
    return (
        <Card>
            <CardHeader
                avatar={<Avatar>{success ? <Done /> : <Error />}</Avatar>}
                title={`Registro de ${success ? '' : 'intento de '}carga ${
                    success ? 'exitosa ' : ''
                }de datos`}
                titleTypographyProps={{variant: 'h6'}}
            />
            <CardContent>
                <Table>
                    <TableBody>
                        {rows.map((row, i) => (
                            <TableRow key={`row-${i}`}>
                                <TableCell style={{width: '30%'}} component="th" scope="row" align="right">
                                    <Typography>{row.label}</Typography>
                                </TableCell>
                                <TableCell>{row.cell}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {children}
            </CardContent>
        </Card>
    );
};

const mapStateToProps = ({auth}) => ({auth});

export default connect(mapStateToProps)(BaseVoucher);
