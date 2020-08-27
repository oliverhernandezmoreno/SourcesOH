SELECT
  TOP 1 tag,
  'el-mauro.s-4320PZD2SUP.ef-mvp.m2.parameters.presion-poros' AS name,
  time AS timestamp,
  (CAST(value as float64) * 10.19716) + 735.89 AS value
FROM pisnapshot
WHERE tag LIKE '4320PZD2SUP(GeoM)'
ORDER BY tag, time DESC
