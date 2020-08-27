SELECT
  TOP 1 tag,
  'el-mauro.s-4320PZD1SUP.ef-mvp.m2.parameters.presion-poros' AS name,
  time AS timestamp,
  (CAST(value as float64) * 10.19716) + 791.90 AS value
FROM pisnapshot
WHERE tag LIKE '4320PZD1SUP(GeoM)'
ORDER BY tag, time DESC
