-- Migration: drop condicionesAlmacenamiento from products
-- Generated: 2026-01-03

BEGIN;

-- For PostgreSQL: drop the column if it exists
ALTER TABLE "products" DROP COLUMN IF EXISTS "condicionesAlmacenamiento";

COMMIT;
