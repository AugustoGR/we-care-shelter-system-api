-- Adicionar módulos padrão para todos os abrigos existentes que não possuem módulos
INSERT INTO shelter_modules (id, "shelterId", "moduleKey", active, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  s.id,
  m.key,
  m.active_default,
  NOW(),
  NOW()
FROM shelters s
CROSS JOIN (
  VALUES 
    ('people', true),
    ('resources', true),
    ('volunteers', true),
    ('animals', false),
    ('reports', false)
) AS m(key, active_default)
WHERE NOT EXISTS (
  SELECT 1 FROM shelter_modules sm 
  WHERE sm."shelterId" = s.id AND sm."moduleKey" = m.key
);
