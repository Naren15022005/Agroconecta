-- AlterTable
ALTER TABLE `agricultores` MODIFY `ubicacion` VARCHAR(191) NULL,
    MODIFY `descripcion` VARCHAR(191) NULL,
    MODIFY `foto` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `clientes` MODIFY `direccion` VARCHAR(191) NULL,
    MODIFY `preferencias` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `empresas` MODIFY `direccion` VARCHAR(191) NULL,
    MODIFY `descripcion` VARCHAR(191) NULL,
    MODIFY `logo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `orders` MODIFY `deliveryAddress` VARCHAR(191) NULL,
    MODIFY `deliveryNotes` VARCHAR(191) NULL;
