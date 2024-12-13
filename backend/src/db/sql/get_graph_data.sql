WITH graph_data AS (
  SELECT id 
  FROM graphs 
  WHERE name = 'Graph name'
)
SELECT 
  a.statement,
  COALESCE(SUM(CASE WHEN r.type = 'agree' THEN 1 ELSE 0 END), 0) as agrees,
  COALESCE(SUM(CASE WHEN r.type = 'disagree' THEN 1 ELSE 0 END), 0) as disagrees,
  COALESCE(SUM(CASE WHEN r.type = 'unclear' THEN 1 ELSE 0 END), 0) as unclear
FROM arguments a
JOIN graph_data g ON a.graph_id = g.id
LEFT JOIN reactions r ON a.id = r.argument_id
GROUP BY a.id, a.statement
ORDER BY a.id;