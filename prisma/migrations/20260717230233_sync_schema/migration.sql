/*
  Warnings:

  - You are about to alter the column `paymentMethod` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(4))`.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `pagoVerificado` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `paymentMethod` ENUM('TRANSFERENCIA', 'NEQUI', 'PASARELA', 'MERCADOPAGO') NOT NULL DEFAULT 'TRANSFERENCIA';

-- AlterTable
ALTER TABLE `pagos` ADD COLUMN `comprobanteUrl` VARCHAR(191) NULL,
    ADD COLUMN `referencia` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `imagenes` TEXT NULL,
    MODIFY `certificaciones` TEXT NULL,
    MODIFY `metodosEntrega` TEXT NULL;

-- AlterTable
ALTER TABLE `sales` MODIFY `productoId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `payment_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `pedidoId` VARCHAR(191) NOT NULL,
    `compradorId` VARCHAR(191) NOT NULL,
    `agricultorId` VARCHAR(191) NOT NULL,
    `monto` DECIMAL(12, 2) NOT NULL,
    `metodo` VARCHAR(191) NOT NULL,
    `comprobanteUrl` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'PENDIENTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `payment_transactions_pedidoId_idx`(`pedidoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_orders` (
    `id` VARCHAR(191) NOT NULL,
    `pedido_id` VARCHAR(191) NOT NULL,
    `agricultor_id` VARCHAR(191) NOT NULL,
    `cliente_nombre` VARCHAR(191) NOT NULL,
    `producto_resumen` VARCHAR(191) NOT NULL,
    `comprobanteUrl` VARCHAR(191) NULL,
    `monto_bruto` DECIMAL(12, 2) NOT NULL,
    `comision_plataforma` DECIMAL(12, 2) NOT NULL,
    `monto_neto` DECIMAL(12, 2) NOT NULL,
    `metodo_pago_cliente` VARCHAR(191) NOT NULL,
    `estado` ENUM('PENDIENTE', 'PAGADO_INDIVIDUAL', 'PAGADO_MASIVO', 'REEMBOLSADO', 'BLOQUEADO') NOT NULL DEFAULT 'PENDIENTE',
    `liquidacion_id` VARCHAR(191) NULL,
    `pagado_en` DATETIME(3) NULL,
    `history` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `liquidaciones` (
    `id` VARCHAR(191) NOT NULL,
    `agricultor_id` VARCHAR(191) NOT NULL,
    `total_pagado` DECIMAL(12, 2) NOT NULL,
    `cantidad_pedidos` INTEGER NOT NULL,
    `tipo_pago` ENUM('INDIVIDUAL', 'MASIVO') NOT NULL,
    `fecha_pago` DATETIME(3) NOT NULL,
    `metodo_pago` VARCHAR(191) NULL,
    `comprobante_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorites` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `favorites_userId_idx`(`userId`),
    INDEX `favorites_productId_idx`(`productId`),
    UNIQUE INDEX `favorites_userId_productId_key`(`userId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payment_transactions` ADD CONSTRAINT `payment_transactions_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `accounts` RENAME INDEX `accounts_userId_fkey` TO `accounts_userId_idx`;

-- RenameIndex
ALTER TABLE `cart_items` RENAME INDEX `cart_items_productId_fkey` TO `cart_items_productId_idx`;

-- RenameIndex
ALTER TABLE `comisiones` RENAME INDEX `comisiones_ventaId_fkey` TO `comisiones_ventaId_idx`;

-- RenameIndex
ALTER TABLE `impuestos` RENAME INDEX `impuestos_ventaId_fkey` TO `impuestos_ventaId_idx`;

-- RenameIndex
ALTER TABLE `notifications` RENAME INDEX `notifications_pedidoId_fkey` TO `notifications_pedidoId_idx`;

-- RenameIndex
ALTER TABLE `notifications` RENAME INDEX `notifications_userId_fkey` TO `notifications_userId_idx`;

-- RenameIndex
ALTER TABLE `order_items` RENAME INDEX `order_items_orderId_fkey` TO `order_items_orderId_idx`;

-- RenameIndex
ALTER TABLE `order_items` RENAME INDEX `order_items_productId_fkey` TO `order_items_productId_idx`;

-- RenameIndex
ALTER TABLE `orders` RENAME INDEX `orders_buyerId_fkey` TO `orders_buyerId_idx`;

-- RenameIndex
ALTER TABLE `pagos` RENAME INDEX `pagos_userId_fkey` TO `pagos_userId_idx`;

-- RenameIndex
ALTER TABLE `products` RENAME INDEX `products_agricultorId_fkey` TO `products_agricultorId_idx`;

-- RenameIndex
ALTER TABLE `products` RENAME INDEX `products_categoryId_fkey` TO `products_categoryId_idx`;

-- RenameIndex
ALTER TABLE `products` RENAME INDEX `products_subcategoryId_fkey` TO `products_subcategoryId_idx`;

-- RenameIndex
ALTER TABLE `sales` RENAME INDEX `sales_compradorId_fkey` TO `sales_compradorId_idx`;

-- RenameIndex
ALTER TABLE `sales` RENAME INDEX `sales_vendedorId_fkey` TO `sales_vendedorId_idx`;

-- RenameIndex
ALTER TABLE `sessions` RENAME INDEX `sessions_userId_fkey` TO `sessions_userId_idx`;

-- RenameIndex
ALTER TABLE `subcategories` RENAME INDEX `subcategories_categoryId_fkey` TO `subcategories_categoryId_idx`;

-- RenameIndex
ALTER TABLE `transacciones` RENAME INDEX `transacciones_userId_fkey` TO `transacciones_userId_idx`;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `users_roleId_fkey` TO `users_roleId_idx`;

-- RenameIndex
ALTER TABLE `wallet_transactions` RENAME INDEX `wallet_transactions_walletId_fkey` TO `wallet_transactions_walletId_idx`;

-- RenameIndex
ALTER TABLE `wallets` RENAME INDEX `wallets_userId_fkey` TO `wallets_userId_idx`;

-- RenameIndex
ALTER TABLE `withdraw_requests` RENAME INDEX `withdraw_requests_userId_fkey` TO `withdraw_requests_userId_idx`;
