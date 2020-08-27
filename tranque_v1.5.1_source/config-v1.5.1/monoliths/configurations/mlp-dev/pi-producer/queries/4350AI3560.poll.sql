SELECT
  TOP 10 tag,
  'el-mauro.s-4350AI3560.ef-mvp.m2.parameters.turbiedad' AS "name",
  time AS "timestamp",
  value
FROM piarchive..picomp2
WHERE tag LIKE '4350AI3560(PV)'
ORDER BY tag, time DESC
