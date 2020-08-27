export const getEFLabel = (param) => {
    switch (param) {
        case 'revancha-operacional':
            return ' Revancha Operacional';
        case 'altura-muro':
            return 'Altura de Muro';
        case 'pendiente-talud':
            return 'Pendiente de talud';
        case 'pendiente-global-aguas-arriba':
            return 'Pendiente global - aguas arriba';
        case 'presion-poros':
            return 'Presión de Poros';
        case 'revancha-hidraulica':
            return 'Revancha hidráulica';
        case 'distancia-minima':
            return 'Distancia mínima laguna-muro';
        case 'volumen-relave':
            return 'Relaves acumulados en depósito';
        case 'pendiente-playa':
            return 'Pendiente de playa';
        case 'ancho-coronamiento':
            return 'Ancho de coronamiento';
        case 'perfiles-topograficos':
            return 'Perfiles topográficos';
        case 'cotas-piezometricas-en-el-tiempo':
            return 'Cotas piezométricas en el tiempo';
        case 'perfil-topografico-y-cotas-piezometricas':
            return 'Perfil topográfico y cotas piezométricas';
        case 'nivel-freatico-de-cubeta':
            return 'Nivel freático de cubeta';
        case 'detalle-de-piezometro':
            return 'Detalle de piezómetro';
        case 'caudal':
            return 'Caudal';
        case 'turbiedad':
            return 'Turbiedad';
        case 'detalle-de-caudalimetro':
            return 'Detalle de caudalímetro';
        case 'detalle-de-turbidimetro':
            return 'Detalle de turbidímetro';
        case 'intensidad-de-lluvia':
            return 'Intensidad de lluvia';
        case 'tonelaje':
            return 'Tonelaje';
        case 'potencial-de-rebalse':
            return 'Potencial de rebalse'
        case 'grietas-en-el-muro':
            return "Presencia de grietas en el muro";
        case 'humedad-o-filtraciones-en-talud':
            return "Evidencia de humedad y/o filtraciones en talud aguas abajo del muro"
        case 'subsidencia-o-socavacion-cerca-del-muro':
            return "Fenómeno de subsidencia o socavación en el muro o en la cubeta cercana al muro"
        case 'integridad-de-los-estribos':
            return "Integridad del estribo"
        case 'vertedero':
            return "Vertedero de emergencia"
        case 'porcentaje-de-finos':
            return "Porcentaje de finos";
        case 'densidad-del-muro':
            return "Densidad del muro";
        case 'curva-granulometrica':
            return 'Curva granulométrica';
        case 'deformacion-y-resistencia':
            return "Módulos de deformación y resistencia"
        case 'resistencia-de-relaves':
            return "Resistencia del material de relaves"
        case 'diseño-de-drenaje':
            return "Diseño del sistema de drenaje"
        case 'caracterizacion-geotecnica':
            return "Caracterización geotécnica del suelo"
        case 'estudio-de-revancha':
            return "Estudio de revancha mínima"
        default:
            return ' ';
    }
};
