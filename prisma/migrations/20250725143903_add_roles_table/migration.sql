/*
  Migración personalizada para agregar tabla de roles
  - Crear tabla roles
  - Poblar con roles por defecto
  - Agregar columna roleId a users con valores por defecto
  - Migrar datos del enum rol a roleId
  - Eliminar columna rol original
*/

-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Poblar tabla de roles con los roles por defecto
INSERT INTO `roles` (`id`, `name`, `displayName`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES 
('AGRC_ROL_AGRICULTOR', 'agricultor', 'Agricultor', 'Productor agrícola que vende productos', 1, NOW(), NOW()),
('AGRC_ROL_CLIENTE', 'cliente', 'Cliente', 'Comprador de productos agrícolas', 1, NOW(), NOW()),
('AGRC_ROL_EMPRESA', 'empresa', 'Empresa', 'Empresa compradora de productos', 1, NOW(), NOW()),
('AGRC_ROL_ADMIN', 'admin', 'Administrador', 'Administrador del sistema', 1, NOW(), NOW());

-- Agregar columna roleId temporal (nullable)
ALTER TABLE `users` ADD COLUMN `roleId` VARCHAR(191) NULL;

-- Migrar datos del enum rol a la nueva columna roleId
UPDATE `users` SET `roleId` = 'AGRC_ROL_AGRICULTOR' WHERE `rol` = 'agricultor';
UPDATE `users` SET `roleId` = 'AGRC_ROL_CLIENTE' WHERE `rol` = 'cliente';
UPDATE `users` SET `roleId` = 'AGRC_ROL_EMPRESA' WHERE `rol` = 'empresa';
UPDATE `users` SET `roleId` = 'AGRC_ROL_ADMIN' WHERE `rol` = 'admin';

-- Hacer roleId NOT NULL (ahora que todos los registros tienen valor)
ALTER TABLE `users` MODIFY COLUMN `roleId` VARCHAR(191) NOT NULL;

-- Agregar foreign key constraint
ALTER TABLE `users` ADD CONSTRAINT `users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Eliminar la columna rol original
ALTER TABLE `users` DROP COLUMN `rol`;
