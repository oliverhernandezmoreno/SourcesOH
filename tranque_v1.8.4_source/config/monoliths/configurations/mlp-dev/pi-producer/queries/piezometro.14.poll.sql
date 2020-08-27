SELECT
  TOP 1 tag,
  'el-mauro.s-4320PZD3INF.ef-mvp.m2.parameters.presion-poros' AS name,
  time AS timestamp,
  (CAST(value as float64) * 10.19716) + 720.53 AS value
FROM pisnapshot
WHERE tag LIKE '4320PZD3INF(GeoM)'
ORDER BY tag, time DESC
