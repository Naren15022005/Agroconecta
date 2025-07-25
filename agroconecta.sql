-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-07-2025 a las 00:29:19
-- Versión del servidor: 10.4.27-MariaDB
-- Versión de PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `agroconecta`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `accounts`
--

CREATE TABLE `accounts` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `providerAccountId` varchar(191) NOT NULL,
  `refresh_token` text DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `expires_at` int(11) DEFAULT NULL,
  `token_type` varchar(191) DEFAULT NULL,
  `scope` varchar(191) DEFAULT NULL,
  `id_token` text DEFAULT NULL,
  `session_state` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `agricultores`
--

CREATE TABLE `agricultores` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `telefono` varchar(191) DEFAULT NULL,
  `ubicacion` varchar(191) DEFAULT NULL,
  `descripcion` varchar(191) DEFAULT NULL,
  `foto` varchar(191) DEFAULT NULL,
  `verificado` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `agricultores`
--

INSERT INTO `agricultores` (`id`, `user_id`, `telefono`, `ubicacion`, `descripcion`, `foto`, `verificado`, `createdAt`, `updatedAt`) VALUES
('AGRC_AGR_MDJ8YJGPC5E7', 'AGRC_USR_MDJ8YJGLV5W8', '+57 310 987 6543', 'Finca La Esperanza, Boyacá, Colombia', 'Agricultor con 15 años de experiencia en cultivos orgánicos', NULL, 1, '2025-07-25 20:01:26.282', '2025-07-25 20:01:26.282'),
('AGRC_AGR_MDJ9T9BJKEKY', 'AGRC_USR_MDJ9T9B9JXM3', NULL, NULL, NULL, NULL, 0, '2025-07-25 20:25:19.472', '2025-07-25 20:25:19.472');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cart_items`
--

CREATE TABLE `cart_items` (
  `id` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categories`
--

CREATE TABLE `categories` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES
('AGRC_CAT_MDJ8YJBKA4C5', 'Frutas', 'Frutas frescas de cosecha local', 1, '2025-07-25 20:01:26.098', '2025-07-25 20:01:26.098'),
('AGRC_CAT_MDJ8YJBRT9U0', 'Verduras', 'Verduras frescas y orgánicas', 1, '2025-07-25 20:01:26.104', '2025-07-25 20:01:26.104'),
('AGRC_CAT_MDJ8YJBXOZGL', 'Hortalizas', 'Hortalizas variadas de temporada', 1, '2025-07-25 20:01:26.110', '2025-07-25 20:01:26.110'),
('AGRC_CAT_MDJ8YJC0IL01', 'Legumbres', 'Legumbres y granos frescos', 1, '2025-07-25 20:01:26.113', '2025-07-25 20:01:26.113'),
('AGRC_CAT_MDJ8YJC31HM1', 'Hierbas Aromáticas', 'Hierbas frescas para cocinar', 1, '2025-07-25 20:01:26.117', '2025-07-25 20:01:26.117'),
('AGRC_CAT_MDJ8YJC7OL8S', 'Cereales', 'Cereales y granos integrales', 1, '2025-07-25 20:01:26.120', '2025-07-25 20:01:26.120');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `telefono` varchar(191) DEFAULT NULL,
  `direccion` varchar(191) DEFAULT NULL,
  `preferencias` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `user_id`, `telefono`, `direccion`, `preferencias`, `createdAt`, `updatedAt`) VALUES
('AGRC_CLI_MDJ8YJIY47B8', 'AGRC_USR_MDJ8YJIU4UOH', '+57 300 123 4567', 'Calle 123 #45-67, Bogotá', 'Productos orgánicos, frutas tropicales', '2025-07-25 20:01:26.363', '2025-07-25 20:01:26.363');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresas`
--

CREATE TABLE `empresas` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `razon_social` varchar(191) NOT NULL,
  `nit` varchar(191) NOT NULL,
  `telefono` varchar(191) DEFAULT NULL,
  `direccion` varchar(191) DEFAULT NULL,
  `sector` varchar(191) DEFAULT NULL,
  `descripcion` varchar(191) DEFAULT NULL,
  `logo` varchar(191) DEFAULT NULL,
  `verificada` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `id` varchar(191) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` enum('PENDIENTE','CONFIRMADO','EN_PREPARACION','EN_CAMINO','EN_PUNTO','ENTREGADO','CANCELADO','NO_ENTREGADO') NOT NULL DEFAULT 'PENDIENTE',
  `deliveryMethod` enum('ENTREGA_DIRECTA','PUNTO_ENCUENTRO','REPARTIDOR_ALIADO','EMPRESA_TRANSPORTADORA') NOT NULL DEFAULT 'ENTREGA_DIRECTA',
  `paymentMethod` enum('CONTRAENTREGA','TRANSFERENCIA','NEQUI','DAVIPLATA','PASARELA') NOT NULL DEFAULT 'CONTRAENTREGA',
  `deliveryAddress` varchar(191) DEFAULT NULL,
  `deliveryNotes` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `buyerId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_items`
--

CREATE TABLE `order_items` (
  `id` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `reservedStock` int(11) NOT NULL DEFAULT 0,
  `unit` varchar(191) NOT NULL,
  `imageUrl` varchar(191) DEFAULT NULL,
  `status` enum('DISPONIBLE','AGOTADO','SUSPENDIDO') NOT NULL DEFAULT 'DISPONIBLE',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `agricultorId` varchar(191) NOT NULL,
  `categoryId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `reservedStock`, `unit`, `imageUrl`, `status`, `createdAt`, `updatedAt`, `agricultorId`, `categoryId`) VALUES
('AGRC_PRD_MDJ8YJJ40A5U', 'Lechuga Crespa', 'Lechuga crespa fresca, cultivada sin pesticidas', '1200.00', 25, 0, 'unidad', NULL, 'DISPONIBLE', '2025-07-25 20:01:26.377', '2025-07-25 20:01:26.377', 'AGRC_AGR_MDJ8YJGPC5E7', 'AGRC_CAT_MDJ8YJBRT9U0'),
('AGRC_PRD_MDJ8YJJ46X4J', 'Mango Tommy', 'Mango Tommy fresco y dulce, cosechado en su punto óptimo de maduración', '2500.00', 50, 0, 'lb', NULL, 'DISPONIBLE', '2025-07-25 20:01:26.370', '2025-07-25 20:01:26.370', 'AGRC_AGR_MDJ8YJGPC5E7', 'AGRC_CAT_MDJ8YJBKA4C5'),
('AGRC_PRD_MDJ8YJJ4G9VD', 'Aguacate Hass', 'Aguacate Hass cremoso y nutritivo, ideal para ensaladas y preparaciones', '1800.00', 30, 5, 'unidad', NULL, 'DISPONIBLE', '2025-07-25 20:01:26.374', '2025-07-25 20:01:26.374', 'AGRC_AGR_MDJ8YJGPC5E7', 'AGRC_CAT_MDJ8YJBKA4C5'),
('AGRC_PRD_MDJ8YJJ4T3UX', 'Tomate Cherry', 'Tomates cherry dulces y jugosos, perfectos para ensaladas', '3000.00', 40, 2, 'lb', NULL, 'DISPONIBLE', '2025-07-25 20:01:26.382', '2025-07-25 20:01:26.382', 'AGRC_AGR_MDJ8YJGPC5E7', 'AGRC_CAT_MDJ8YJBRT9U0'),
('product_1753475882847', 'platanito', 'platano banano amarillo', '1200.00', 20, 0, 'manojo', '', 'DISPONIBLE', '2025-07-25 20:38:02.849', '2025-07-25 20:38:02.849', 'AGRC_AGR_MDJ9T9BJKEKY', 'AGRC_CAT_MDJ8YJBKA4C5');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `displayName` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `name`, `displayName`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES
('AGRC_ROL_ADMIN', 'admin', 'Administrador', 'Administrador del sistema', 1, '2025-07-25 15:01:24.000', '2025-07-25 15:01:24.000'),
('AGRC_ROL_AGRICULTOR', 'agricultor', 'Agricultor', 'Productor agrícola que vende productos', 1, '2025-07-25 15:01:24.000', '2025-07-25 15:01:24.000'),
('AGRC_ROL_CLIENTE', 'cliente', 'Cliente', 'Comprador de productos agrícolas', 1, '2025-07-25 15:01:24.000', '2025-07-25 15:01:24.000'),
('AGRC_ROL_EMPRESA', 'empresa', 'Empresa', 'Empresa compradora de productos', 1, '2025-07-25 15:01:24.000', '2025-07-25 15:01:24.000');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(191) NOT NULL,
  `sessionToken` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `nombre` varchar(191) NOT NULL,
  `correo` varchar(191) NOT NULL,
  `contraseña` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `roleId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `nombre`, `correo`, `contraseña`, `isActive`, `createdAt`, `updatedAt`, `roleId`) VALUES
('AGRC_USR_MDJ8YJEGOWGJ', 'Administrador AgroConecta', 'admin@agroconecta.co', '$2b$10$FmSALUgAlfaICvQdb0DDcuWaH8MfguFmL7111Ne1/FAyiR6rlYMUu', 1, '2025-07-25 20:01:26.202', '2025-07-25 20:01:26.202', 'AGRC_ROL_ADMIN'),
('AGRC_USR_MDJ8YJGLV5W8', 'Juan Rodríguez', 'juan.agricultor@gmail.com', '$2b$10$Fu6Goisgu7IhhUGwG/Mo3O2t1wZkkVWbVRekYq/UWC29O7pCStZni', 1, '2025-07-25 20:01:26.278', '2025-07-25 20:01:26.278', 'AGRC_ROL_AGRICULTOR'),
('AGRC_USR_MDJ8YJIU4UOH', 'María González', 'maria.cliente@gmail.com', '$2b$10$PI8A5nTkvLZyjCBe.ZAl3uFUPxW1/OZJN6GveZrGKAn8BckFv4CB6', 1, '2025-07-25 20:01:26.359', '2025-07-25 20:01:26.359', 'AGRC_ROL_CLIENTE'),
('AGRC_USR_MDJ9T9B9JXM3', 'naren alfonso', 'alfonsonavarroch@gmail.com', '$2b$10$ag/inuk0WLj.sAUBN8.wXe60FBsRo9u7Jmn4WJ6vCNAbV9ioSMUDq', 1, '2025-07-25 20:25:19.462', '2025-07-25 20:27:02.031', 'AGRC_ROL_AGRICULTOR');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `verification_tokens`
--

CREATE TABLE `verification_tokens` (
  `identifier` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('4a38e131-62f5-499c-b7be-8798c7b50572', '2aee87955b7cceea916335f3546ff2e6e2d4fcc759817a1fbf09ac67dd3fe94c', '2025-07-25 20:01:24.696', '20250723205148_init', NULL, NULL, '2025-07-25 20:01:23.865', 1),
('605078cb-258a-4fcb-afc8-88e0886fcde9', '49573a81617cd3abaf8ae25a8948bfeb2c8924836cd76147e1a36598681db421', '2025-07-25 20:01:24.872', '20250725132905_custom_agrc_ids', NULL, NULL, '2025-07-25 20:01:24.698', 1),
('8797e12d-4924-4f60-9e6e-d155c7182f1e', '657fcdf895a796f3b5818f9ecd28893a405d0c0c9a94be8853fee660b9258d6d', '2025-07-25 20:01:24.995', '20250725143903_add_roles_table', NULL, NULL, '2025-07-25 20:01:24.873', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `accounts_provider_providerAccountId_key` (`provider`,`providerAccountId`),
  ADD KEY `accounts_userId_fkey` (`userId`);

--
-- Indices de la tabla `agricultores`
--
ALTER TABLE `agricultores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `agricultores_user_id_key` (`user_id`);

--
-- Indices de la tabla `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cart_items_userId_productId_key` (`userId`,`productId`),
  ADD KEY `cart_items_productId_fkey` (`productId`);

--
-- Indices de la tabla `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_name_key` (`name`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clientes_user_id_key` (`user_id`);

--
-- Indices de la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `empresas_user_id_key` (`user_id`),
  ADD UNIQUE KEY `empresas_nit_key` (`nit`);

--
-- Indices de la tabla `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_buyerId_fkey` (`buyerId`);

--
-- Indices de la tabla `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_orderId_fkey` (`orderId`),
  ADD KEY `order_items_productId_fkey` (`productId`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_agricultorId_fkey` (`agricultorId`),
  ADD KEY `products_categoryId_fkey` (`categoryId`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_key` (`name`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sessions_sessionToken_key` (`sessionToken`),
  ADD KEY `sessions_userId_fkey` (`userId`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_correo_key` (`correo`),
  ADD KEY `users_roleId_fkey` (`roleId`);

--
-- Indices de la tabla `verification_tokens`
--
ALTER TABLE `verification_tokens`
  ADD UNIQUE KEY `verification_tokens_token_key` (`token`),
  ADD UNIQUE KEY `verification_tokens_identifier_token_key` (`identifier`,`token`);

--
-- Indices de la tabla `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `accounts`
--
ALTER TABLE `accounts`
  ADD CONSTRAINT `accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `agricultores`
--
ALTER TABLE `agricultores`
  ADD CONSTRAINT `agricultores_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_items_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `clientes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD CONSTRAINT `empresas_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_agricultorId_fkey` FOREIGN KEY (`agricultorId`) REFERENCES `agricultores` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
