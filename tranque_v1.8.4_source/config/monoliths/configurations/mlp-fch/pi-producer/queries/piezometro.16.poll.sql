SELECT
  TOP 1 tag,
  'el-mauro.s-4320PZD7INF.ef-mvp.m2.parameters.presion-poros' AS name,
  time AS timestamp,
  (CAST(value as float64) * 10.19716) + 719.59 AS value
FROM pisnapshot
WHERE tag LIKE '4320PZD7INF(GeoM)'
ORDER BY tag, time DESC
