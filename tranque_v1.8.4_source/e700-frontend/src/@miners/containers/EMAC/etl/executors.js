import Loader from '@miners/containers/etl/defaults/Loader';
import Validator from '@miners/containers/etl/defaults/Validator';
import Voucher from '@miners/containers/etl/defaults/Voucher';


// Fully supported executors
export const EXECUTORS = [
    {
        executor: 'sma_v1_2019',
        title: 'Planilla estándar SMA',
        loader: Loader,
        validator: Validator,
        voucher: Voucher,
        header: 'Carga de datos de calidad de agua',
        subheader: 'Según planilla estándar SMA',
        description: 'La planilla estándar SMA establece un formato para registrar resultados de mediciones por punto de monitoreo.',
        loaderRoute: 'miners.target.emac.massLoad',
        exitRoute: 'miners.target.emac.data.load'
    },
    {
        executor: 'emac_rev0',
        title: 'Planilla SMA adaptada a plataforma tranque',
        loader: Loader,
        validator: Validator,
        voucher: Voucher,
        header: 'Carga de datos de calidad de agua',
        subheader: 'Según planilla SMA adaptada a plataforma tranque',
        description: 'La planilla SMA adaptada a plataforma tranque establece un formato para registrar resultados de mediciones por punto de monitoreo.',
        loaderRoute: 'miners.target.emac.massLoad',
        exitRoute: 'miners.target.emac.data.load'
    }
];

// Executors supported in read-only mode
export const LEGACY_EXECUTORS = [];
