export const glossary = [
    {name: 'Estatus de conexión de un depósito con la plataforma',
        value: 'Un depósito puede estar integrado o no al Sistema de Monitoreo Central. ' +
          'En caso de estar integrado, la plataforma puede desplegar información sobre el estado de conexión. ' +
          'Si la plataforma detecta conexión con servidores de la minera en intervalos de máximo una hora, ' +
          'se considera que la conexión es normal. En caso contrario, la conexión se considera como fallida. ' +
          'Todos los casos (conexión normal, fallida o inexistente) se informan mediante el icono "enchufe" para cada depósito.'},

    {name: 'Nivel de privacidad de los índices',
        value: 'Existen índices que son visibles en el sitio público y coinciden con aquellos que podrían gatillar alertas públicas, ' +
          'los que se destacan en la interfaz con el icono "ojo". ' +
          'No todos los índices se comunican al sitio público y son sólo informados a autoridad y mineras ' +
          '(estos no son acompañador por el icono "ojo").'},

    {name: 'Estados de los índices',
        value: 'Cualquier índice de la plataforma puede tener asociado alguno de los siguientes estados, ' +
          'según el resultado del cálculo del índice y las reglas de asociación con estados de alerta interna o pública:\n\n' +
          '1. No habilitado: el índice no ha sido configurado y es incapaz de calcular un resultado.\n\n' +
          '2. No afectado: ninguna variable ha excedido un valor de referencia.\n\n' +
          '3. Afectado, sin alertas: el índice ha sido afectado, aunque no se reúnen las condiciones necesarias para activar una alerta pública. ' +
          'En estos casos, existe al menos una variable o parámetro de consideración que ha excedido un valor de referencia.\n\n' +
          '4. Afectado, con alerta amarilla: el índice ha sido afectado y reúne las condiciones para ser asociado a una alerta amarilla. ' +
          'Los índices que gatillan alertas públicas están acompañados con icono "ojo".\n\n' +
          '5. Afectado, con alerta roja: el índice ha sido afectado y reúne las condiciones para ser asociado a una alerta roja. ' +
          'Los índices que gatillan alertas públicas están acompañados con icono "ojo".'},


    {name: 'Nombre de la Empresa', value: 'Nombre de la empresa a cargo del depósito.'},
    {name: 'Rut de la Empresa', value: 'Numero de rut de la empresa a cargo del depósito.'},
    {name: 'Nombre del Representante Legal', value: 'Nombre de la persona de contacto para efectos legales.'},
    {name: 'Dirección', value: 'Dirección de la ubicación del depósito.'},
    {name: 'Nombre de la Faena', value: 'Nombre dado a la faena por la empresa.'},
    {name: 'Ubicación Geográfica', value: 'Ubicación geográfica del depósito, en coordenadas UTM SIRGAS 19 S.'},
    {name: 'Nombre del depósito', value: 'Nombre dado al depósito por la empresa.'},
    {name: 'Depósito de Relaves',
        value: 'Toda obra estructurada en forma segura para contener los relaves provenientes de ' +
                 'una Planta de concentración húmeda de especies de minerales. Además, contempla sus obras anexas. ' +
                 'Su función principal es la de servir como depósito, generalmente, definitivo de los materiales sólidos ' +
                 'proveniente del relave transportado desde la Planta, permitiendo así la recuperación, en gran medida, ' +
                 'del agua que transporta dichos sólidos.'},
    {name: 'Tranque de relaves',
        value: 'Aquel depósito de relaves donde el muro de contención es construido con la fracción más gruesa del relave (arenas).' },
    {name: 'Embalse de relaves',
        value: 'Aquel depósito de relaves donde el muro de contención está construido con ' +
        'material de empréstito y se encuentra impermeabilizado en el coronamiento y en su talud interno. ' +
        'La impermeabilización puede estar realizada con un material natural de baja permeabilidad o de ' +
        'material sintético como geomembrana de alta densidad. ' +
        'También se llama Embalses de relaves aquellos depósitos ubicados en alguna depresión del terreno ' +
        'en que no se requiere la construcción de un muro de contención.'},
    {name: 'Relaves en pasta',
        value: 'Depósito de relaves que presenta una situación intermedia entre el relave espesado y ' +
        'el relave filtrado, corresponde a una mezcla de relaves sólidos y agua -entre 10 y 25% de agua' +
        '- que contiene partículas finas, menores de 20 ?, en una concentración en peso superior al 15%, ' +
        'muy similar a una pulpa de alta densidad. Su depositación se efectúa en forma similar al relave filtrado, ' +
        'sin necesidad de compactación, poseyendo consistencia coloidal.'},
    {name: 'Relaves espesados',
        value: 'Depósito de relaves donde, antes de ser depositados, son sometidos a un proceso de sedimentación, ' +
        'mediante espesadores, eliminándole una parte importante del agua que contienen. ' +
        'El depósito de relaves espesados deberá ser construido de tal forma que se impida que el relave fluya a ' +
        'otras áreas distintas a las del emplazamiento determinado y contar con un sistema de piscinas de ' +
        'recuperación del agua remanente.' },
    {name: 'Relaves filtrados',
        value: 'Depósito de relaves donde, antes de ser depositados, son sometidos a un proceso de filtración, ' +
        'mediante equipos especiales de filtros, donde se asegure que la humedad sea menor a un 20%. ' +
        'Deberá asegurarse que el relave así depositado no fluya a otras áreas distintas a las del emplazamiento determinado.'},
    {name: 'Cantidad relave autorizado',
        value: 'Valor máximo a depositar de pulpa según la Resolución exenta que ' +
                  'autoriza la operación del depósito. La unidad a medir puede ser tonelada si la medición es a las tpm de ' +
                  'relave producidas desde el proceso de flotación, o volumen si se considera el llenado de este.'},
    {name: 'Aguas abajo',
        value: 'Método de construcción que se inicia con un muro de partida de material de empréstito compactado ' +
                  'desde el cual se vacía la arena cicloneada hacia el lado del talud aguas abajo de este muro y las lamas se ' +
                  'depositan hacia el talud aguas arriba. Cuando el muro se ha peraltado lo suficiente, usualmente 2 a 4 m., ' +
                  'se efectúa el levante del muro, desplazando los hidrociclones a una mayor elevación en la dirección hacia ' +
                  'aguas abajo y comenzando una nueva etapa de descarga de arenas y peralte del muro. ' +
                  'A veces se dispone también de un segundo muro pre-existente aguas abajo. ' +
                  'Las arenas se pueden disponer en capas inclinadas, según el manteo del talud del muro de partida, ' +
                  'o bien, disponerlas en capas horizontales hacia aguas abajo del muro de partida.'},
    {name: 'Método Eje Central o Mixto',
        value: 'Método de construcción que se inicia con un muro de partida de material de ' +
        'empréstito compactado, sobre el cual se depositan las arenas cicloneadas hacia el lado de aguas abajo y las ' +
        'lamas hacia el lado de aguas arriba. Una vez completado el vaciado de arenas y lamas correspondiente al ' +
        'muro inicial, se eleva la línea de alimentación de arenas y lamas, siguiendo el mismo plano vertical ' +
        'inicial de la berma de coronamiento del muro de partida. Esto permite lograr un muro de arenas cuyo ' +
        'eje se mantiene en el mismo plano vertical, cuyo talud de aguas arriba es más o menos vertical, ' +
        'y cuyo talud de aguas abajo puede tener la inclinación que el diseño considera adecuada.'},
    {name: 'Cantidad relave actual', value: 'Cantidad depositada en el depósito al momento de enviar el informe trimestral.'},
    {name: 'Cantidad arenas en muro',
        value: 'Para tranques, es la cantidad de arenas provenientes del cicloneo depositada en el prisma resistente. ' +
                  'Trimestral se refiere al periodo en curso a informar, y acumulada hace referencia a la cantidad de material depositado.'},

    {name: 'Cantidad lamas en cubeta', value: 'Cantidad de lamas depositadas en la cubeta del depósito.'},
    {name: 'Altura del muro a depósito', value: 'Distancia vertical en metros entre el pie del talud y su coronamiento.'},
    {name: 'Largo berma de coronamiento', value: 'Largo de la parte superior del prisma resistente o muro de contención, ' +
                                                 'el cual es muy cercano a la horizontal.'},
    {name: 'Ancho berma de coronamiento', value: 'Ancho de la parte superior del prisma resistente o muro de contención, ' +
                                                 'el cual es muy cercano a la horizontal.'},
    {name: 'Distancia borde de laguna muro de arenas',
        value: 'Distancia en metros entre el muro de arenas y la laguna de aguas claras del depósito.'},
    {name: 'Ancho aproximado sector playa en la cubeta',
        value: 'Ancho donde se descargan los residuos a la cubeta. ' +
                  'Usualmente está seca en la superficie y se asemeja a una playa de arenas finas. ' +
                  'Es la parte del depósito de relaves o lamas situada en las cercanías de la línea de vaciado.'},
    {name: 'Revancha operacional mínima',
        value: 'La diferencia menor, en cota, entre la línea de coronamiento del muro de contención y la superficie inmediatamente ' +
                  'vecina de la fracción lamosa o de la superficie del agua, que se produce en los tranques y embalses de relaves. ' +
                  'Este valor no debe ser menor de 1 metro.'},
    {name: 'Área ocupada (aproximada)', value: 'Área usada por el depósito, considerando para estos efectos tanto su prisma resistente como su cubeta.'},
    {name: 'Angulo de talud externo del muro',
        value: 'Corresponde al ángulo formado por la superficie externa del talud del prisma resistente con el plano horizontal.'},
    {name: 'Angulo de talud interno del muro',
        value: 'Corresponde al ángulo formado por la superficie interna del talud del prisma resistente con el plano horizontal.'},
    {name: 'Método de compactación del muro (equipo)',
        value: 'Método utilizado para minimizar el riesgo de licuefacción y de deformación del talud.'},
    {name: 'Razón Arenas/Lamas', value: 'Razón que hay entre gruesos y finos en la pulpa.'},
    {name: 'Porcentaje de sólido en peso del relave total',
        value: 'Es la relación del peso del sólido seco contenido en la pulpa de relaves frente al peso total de la misma, ' +
                   'expresado en porcentaje; siendo Cp = (Peso solido seco/Peso pulpa relaves) * 100.'},
    {name: 'Porcentaje de humedad relave filtrado y/o espesado',
        value: 'Cantidad de humedad que queda en la pulpa luego de haber sido pasada por el filtro/espesador.'},
    {name: 'Densidad proctor',
        value: 'Corresponde al peso unitario máximo, determinado por el ensayo de compactación normalizado ' +
                  'AASHOT - 180-57/0. Alternativamente, y si la granulometría del material lo requiere, ' +
                  'esta densidad se podría expresar como Dr = (ɣnat/ɣproctor)*100; donde ɣnat = peso unitario del suelo in situ.'},
    {name: 'Densidad relativa',
        value: 'Es el grado de compactación que se puede calcular por la fórmula ' +
                   'Dr = (ɣmax/ ɣnat) * ((ɣnat- ɣmin)/(ɣmax- ɣmin))*100, donde ' +
                   'ɣmax = peso unitario máximo determinado por el método propuesto por ASTM para suelos granulares, ' +
                   'u otro que pruebe ser más efectivo; ' +
                   'y ɣmin = peso unitario máximo determinado por el método propuesto por ASTM para suelos granulares, ' +
                   'u otro que pruebe ser más efectivo.'},
    {name: 'Densidad In-situ', value: 'Densidad que posee un suelo en terreno o en su estado natural.'},
    {name: 'Granulometría de las arenas del muro',
        value: 'Distribución porcentual en masa de los distintos tamaños de partículas que constituyen las arenas del prisma resistente.'},
    {name: 'Granulometría del relave total',
        value: 'Distribución porcentual en masa de los distintos tamaños de partículas que constituyen el relave total.'},
    {name: 'Piezometría',
        value: 'Es el sistema de control de las presiones hidrostáticas en el interior del prisma resistente para detectar ' +
                  'la presencia de sectores saturados. Los instrumentos utilizados se llaman piezómetros y con ellos se detecta el ' +
                  'nivel freático del subsuelo.'},
];
