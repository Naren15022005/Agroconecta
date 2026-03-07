-- Migration: drop condicionesAlmacenamiento from products
-- Generated: 2026-01-03

ALTER TABLE `products`
DROP COLUMN `condicionesAlmacenamiento`;
