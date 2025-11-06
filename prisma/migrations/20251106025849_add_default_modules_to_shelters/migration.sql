-- Adicionar módulos padrão para todos os abrigos existentes
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
ON CONFLICT ("shelterId", "moduleKey") DO NOTHING;
