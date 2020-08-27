export function getDataSource(attrs) {
    return {
        active: true,
        canonical_name: attrs.canonical_name || 'punto-medición',
        coords: attrs.coords || {x: 469149, y: 7379171, srid: 32719},
        deg_coords: attrs.deg_coords || {lat: -23.698042116185366, lng: -69.302617107696},
        geometry: attrs.geometry || "SRID=4326;POINT (-69.30261710769599 -23.69804211618537)",
        group_names: attrs.group_names || [],
        groups: attrs.groups || [],
        hardware_id: attrs.hardware_id || 'punto-medicion-id',
        id: attrs.id || "umzaXV3ZWzOr478FDECLnw",
        meta: attrs.meta || null,
        name: attrs.name || '[Nombre del punto de medición]',
        tableData: attrs.tableData || {id:0},
        type: attrs.type || 'offline'
    }
}