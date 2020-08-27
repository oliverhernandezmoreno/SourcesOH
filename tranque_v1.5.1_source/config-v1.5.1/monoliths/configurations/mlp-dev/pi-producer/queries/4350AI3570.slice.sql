SELECT
  'el-mauro.s-4350AI3570.ef-mvp.m2.parameters.turbiedad' AS "name",
  time AS "timestamp",
  value
FROM piarchive..picomp2
WHERE tag LIKE '4350AI3570(PV)' AND time BETWEEN ? AND ?
ORDER BY tag, time DESC
