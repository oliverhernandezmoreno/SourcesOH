SELECT
  TOP 1 tag,
  'el-mauro.s-4320PZDE007.ef-mvp.m2.parameters.presion-poros' AS name,
  time AS timestamp,
  (CAST(value as float64) * 10.19716) + 724.07 AS value
FROM pisnapshot
WHERE tag LIKE '4320PZDE007(GeoM)'
ORDER BY tag, time DESC
