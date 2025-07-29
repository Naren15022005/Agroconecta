-- Restaura los roles principales para AgroConecta
INSERT INTO role (id, name, displayName) VALUES
  ('1', 'agricultor', 'Campesino/Agricultor'),
  ('2', 'cliente', 'Cliente Individual'),
  ('3', 'empresa', 'Empresa'),
  ('4', 'admin', 'Administrador')
ON DUPLICATE KEY UPDATE name=VALUES(name), displayName=VALUES(displayName);
