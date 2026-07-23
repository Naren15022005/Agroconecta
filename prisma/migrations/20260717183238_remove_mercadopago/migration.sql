-- Removed MercadoPago integration
-- Changes (applied via db push):
-- 1. Dropped column `mercadoPagoPreferenceId` from `orders` table
-- 2. Removed 'MERCADOPAGO' from `orders_paymentMethod` enum
-- 3. Removed `mercadopago` dependency from package.json
-- 4. Deleted src/lib/mercadopago.ts
-- 5. Deleted src/app/api/pagos/mercadopago/route.ts

-- This migration is a marker; the actual DDL was applied via prisma db push.
-- Re-run `prisma db push --accept-data-loss` on a fresh database.
