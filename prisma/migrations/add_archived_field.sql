-- Agregar campo para archivar pedidos sin eliminarlos físicamente
ALTER TABLE orders ADD COLUMN archived BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN archived_at TIMESTAMP NULL;
ALTER TABLE orders ADD COLUMN archived_by VARCHAR(255) NULL;

-- Crear índice para mejorar performance en consultas
CREATE INDEX idx_orders_archived ON orders(archived);
CREATE INDEX idx_orders_status_archived ON orders(status, archived);
