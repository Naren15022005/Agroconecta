-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-07-2025 a las 18:18:17
-- Versión del servidor: 9.0.1
-- Versión de PHP: 8.2.12

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
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `providerAccountId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `access_token` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` int DEFAULT NULL,
  `token_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scope` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_token` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `session_state` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `agricultores`
--

CREATE TABLE `agricultores` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ubicacion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verificado` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `agricultores`
--

INSERT INTO `agricultores` (`id`, `user_id`, `telefono`, `ubicacion`, `descripcion`, `foto`, `verificado`, `createdAt`, `updatedAt`) VALUES
('AGRC_AGR_MDKFOJO4EDFQ', 'AGRC_USR_MDKFOJNGYX2G', NULL, NULL, NULL, NULL, 0, '2025-07-26 15:57:23.478', '2025-07-26 15:57:23.478');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cart_items`
--

CREATE TABLE `cart_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categories`
--

CREATE TABLE `categories` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES
('AGRC_CAT_MDKH0HF8Y4HB', 'Frutas', 'Productos frutales frescos', 1, '2025-07-26 16:34:40.167', '2025-07-26 16:34:40.167'),
('AGRC_CAT_MDKH0HJMN4SX', 'Verduras', 'Verduras y hortalizas', 1, '2025-07-26 16:34:40.212', '2025-07-26 16:34:40.212'),
('AGRC_CAT_MDKH0HJS9LZB', 'Tubérculos', 'Papa, yuca, ñame, arracacha, etc.', 1, '2025-07-26 16:34:40.218', '2025-07-26 16:34:40.218'),
('AGRC_CAT_MDKH0HJYMSCA', 'Granos', 'Arroz, frijol, lenteja, garbanzo, etc.', 1, '2025-07-26 16:34:40.223', '2025-07-26 16:34:40.223'),
('AGRC_CAT_MDKH0HK2FXZY', 'Hierbas', 'Aromáticas, medicinales y culinarias', 1, '2025-07-26 16:34:40.228', '2025-07-26 16:34:40.228'),
('AGRC_CAT_MDKH0HK64YCF', 'Flores', 'Flores, follajes y ornamentales', 1, '2025-07-26 16:34:40.232', '2025-07-26 16:34:40.232');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferencias` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresas`
--

CREATE TABLE `empresas` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon_social` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nit` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sector` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verificada` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` enum('PENDIENTE','CONFIRMADO','EN_PREPARACION','EN_CAMINO','EN_PUNTO','ENTREGADO','CANCELADO','NO_ENTREGADO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `deliveryMethod` enum('ENTREGA_DIRECTA','PUNTO_ENCUENTRO','REPARTIDOR_ALIADO','EMPRESA_TRANSPORTADORA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENTREGA_DIRECTA',
  `paymentMethod` enum('CONTRAENTREGA','TRANSFERENCIA','NEQUI','DAVIPLATA','PASARELA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CONTRAENTREGA',
  `deliveryAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deliveryNotes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `buyerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_items`
--

CREATE TABLE `order_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `reservedStock` int NOT NULL DEFAULT '0',
  `unit` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('DISPONIBLE','AGOTADO','SUSPENDIDO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DISPONIBLE',
  `fechaCosecha` datetime(3) DEFAULT NULL,
  `tiempoEntrega` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stockMinimo` int DEFAULT NULL,
  `pesoAproximado` decimal(10,2) DEFAULT NULL,
  `dimensiones` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `condicionesAlmacenamiento` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certificaciones` json DEFAULT NULL,
  `metodosEntrega` json DEFAULT NULL,
  `horariosDisponibles` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notasEspeciales` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `municipio` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vereda` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipoCultivo` enum('ORGANICO','CONVENCIONAL') COLLATE utf8mb4_unicode_ci DEFAULT 'CONVENCIONAL',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `agricultorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subcategoryId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `reservedStock`, `unit`, `imageUrl`, `status`, `fechaCosecha`, `tiempoEntrega`, `stockMinimo`, `pesoAproximado`, `dimensiones`, `condicionesAlmacenamiento`, `certificaciones`, `metodosEntrega`, `horariosDisponibles`, `notasEspeciales`, `municipio`, `vereda`, `tipoCultivo`, `createdAt`, `updatedAt`, `agricultorId`, `categoryId`, `subcategoryId`) VALUES
('AGRC_PRD_MDKJE39KRBKA', 'Producto Test', '', 100.00, 0, 0, 'kg', '', 'DISPONIBLE', NULL, '1', 0, NULL, NULL, NULL, '[]', '[]', NULL, NULL, NULL, NULL, 'CONVENCIONAL', '2025-07-26 17:41:14.123', '2025-07-26 17:41:14.123', 'AGRC_AGR_MDKFOJO4EDFQ', 'AGRC_CAT_MDKH0HF8Y4HB', NULL),
('AGRC_PRD_MDKJJJ5AP1TC', 'plantano', 'bananas en pijamas xds', 2000.00, 40, 0, 'manojo', '/uploads/productos/1753550710641_banano.jpg', 'DISPONIBLE', '2025-07-26 00:00:00.000', '3', 20, 304.00, '30 x 20 x 15', '20°', '[\"Orgánico certificado\", \"Libre de pesticidas\", \"Cultivo tradicional\"]', '[\"finca\"]', 'lunes a viernes de 8:30 am hasta las 12:30 am', 'nada de nada la verdad', 'cucuta', 'aguascalientes', 'CONVENCIONAL', '2025-07-26 17:45:27.988', '2025-07-26 18:03:00.680', 'AGRC_AGR_MDKFOJO4EDFQ', 'AGRC_CAT_MDKH0HF8Y4HB', 'AGRC_SUB_MDKH0HKL6WEW');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `displayName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `name`, `displayName`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES
('AGRC_ROL_ADMIN', 'admin', 'Administrador', 'Administrador del sistema', 1, '2025-07-26 10:57:09.000', '2025-07-26 10:57:09.000'),
('AGRC_ROL_AGRICULTOR', 'agricultor', 'Agricultor', 'Productor agrícola que vende productos', 1, '2025-07-26 10:57:09.000', '2025-07-26 10:57:09.000'),
('AGRC_ROL_CLIENTE', 'cliente', 'Cliente', 'Comprador de productos agrícolas', 1, '2025-07-26 10:57:09.000', '2025-07-26 10:57:09.000'),
('AGRC_ROL_EMPRESA', 'empresa', 'Empresa', 'Empresa compradora de productos', 1, '2025-07-26 10:57:09.000', '2025-07-26 10:57:09.000');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sessionToken` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subcategories`
--

CREATE TABLE `subcategories` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `subcategories`
--

INSERT INTO `subcategories` (`id`, `name`, `description`, `isActive`, `createdAt`, `updatedAt`, `categoryId`) VALUES
('AGRC_SUB_MDKH0HKB3QN1', 'Cítricos', 'Naranja, limón, mandarina, etc.', 1, '2025-07-26 16:34:40.237', '2025-07-26 16:34:40.237', 'AGRC_CAT_MDKH0HF8Y4HB'),
('AGRC_SUB_MDKH0HKL6WEW', 'Exóticas', 'Mango, maracuyá, guanábana, etc.', 1, '2025-07-26 16:34:40.247', '2025-07-26 16:34:40.247', 'AGRC_CAT_MDKH0HF8Y4HB'),
('AGRC_SUB_MDKH0HKQ9VU2', 'Hortalizas de hoja', 'Lechuga, espinaca, acelga, etc.', 1, '2025-07-26 16:34:40.253', '2025-07-26 16:34:40.253', 'AGRC_CAT_MDKH0HJMN4SX'),
('AGRC_SUB_MDKH0HKWHYDI', 'Hortalizas de fruto', 'Tomate, pimentón, pepino, etc.', 1, '2025-07-26 16:34:40.257', '2025-07-26 16:34:40.257', 'AGRC_CAT_MDKH0HJMN4SX'),
('AGRC_SUB_MDKH0HL04KSA', 'Papa', 'Papa criolla, pastusa, sabanera, etc.', 1, '2025-07-26 16:34:40.261', '2025-07-26 16:34:40.261', 'AGRC_CAT_MDKH0HJS9LZB'),
('AGRC_SUB_MDKH0HL4AGUP', 'Yuca', 'Yuca blanca, amarilla, etc.', 1, '2025-07-26 16:34:40.265', '2025-07-26 16:34:40.265', 'AGRC_CAT_MDKH0HJS9LZB'),
('AGRC_SUB_MDKH0HL81EUU', 'Arroz', 'Arroz integral, blanco, etc.', 1, '2025-07-26 16:34:40.270', '2025-07-26 16:34:40.270', 'AGRC_CAT_MDKH0HJYMSCA'),
('AGRC_SUB_MDKH0HLD4B6Y', 'Frijol', 'Frijol rojo, negro, etc.', 1, '2025-07-26 16:34:40.275', '2025-07-26 16:34:40.275', 'AGRC_CAT_MDKH0HJYMSCA'),
('AGRC_SUB_MDKH0HLHVFQG', 'Hierbas aromáticas', 'Cilantro, perejil, albahaca, etc.', 1, '2025-07-26 16:34:40.279', '2025-07-26 16:34:40.279', 'AGRC_CAT_MDKH0HK2FXZY'),
('AGRC_SUB_MDKH0HLMQBKJ', 'Hierbas medicinales', 'Manzanilla, menta, etc.', 1, '2025-07-26 16:34:40.284', '2025-07-26 16:34:40.284', 'AGRC_CAT_MDKH0HK2FXZY'),
('AGRC_SUB_MDKH0HLRENFN', 'Flores ornamentales', 'Rosas, lirios, etc.', 1, '2025-07-26 16:34:40.289', '2025-07-26 16:34:40.289', 'AGRC_CAT_MDKH0HK64YCF'),
('AGRC_SUB_MDKH0HLVXHSC', 'Follajes', 'Helechos, etc.', 1, '2025-07-26 16:34:40.293', '2025-07-26 16:34:40.293', 'AGRC_CAT_MDKH0HK64YCF');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contraseña` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `roleId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `nombre`, `correo`, `contraseña`, `isActive`, `createdAt`, `updatedAt`, `roleId`) VALUES
('AGRC_USR_MDKFOJNGYX2G', 'naren', 'alfonsonavarroch@gmail.com', '$2b$10$uwrFI6LcqxKbncgPTw7xQOAc2vynRCU5BbuPuTc66zaHlv.92qEma', 1, '2025-07-26 15:57:23.455', '2025-07-26 15:58:06.335', 'AGRC_ROL_AGRICULTOR');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `verification_tokens`
--

CREATE TABLE `verification_tokens` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `identifier` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('2f00c045-f8d5-4436-828d-1582b925c480', '2da7220dc7295af460bf744c589730a3c9fbd1c1de13f8688ceb235f07968796', '2025-07-26 15:50:58.009', '20250726155057_add_verification_token', NULL, NULL, '2025-07-26 15:50:57.942', 1),
('5d5a3e4f-1da6-406b-b121-b8e08dd23076', 'f9a3900bb74ecc426125425002b599a051da04ae0393987eab2adeb0ddbd2894', '2025-07-26 16:21:08.232', '20250726162107_add_subcategory', NULL, NULL, '2025-07-26 16:21:07.876', 1),
('df95ff35-164a-43c0-a9d6-c1423d19ef68', '2e49cf4a96850d3f498b835eeed80cf7783d61124ff8ebdd3b7719046ac0093d', '2025-07-26 15:48:55.876', '20250726154853_init', NULL, NULL, '2025-07-26 15:48:53.135', 1);

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
  ADD KEY `products_categoryId_fkey` (`categoryId`),
  ADD KEY `products_subcategoryId_fkey` (`subcategoryId`);

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
-- Indices de la tabla `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subcategories_name_key` (`name`),
  ADD KEY `subcategories_categoryId_fkey` (`categoryId`);

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
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `verification_tokens_token_key` (`token`);

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
  ADD CONSTRAINT `orders_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_agricultorId_fkey` FOREIGN KEY (`agricultorId`) REFERENCES `agricultores` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `products_subcategoryId_fkey` FOREIGN KEY (`subcategoryId`) REFERENCES `subcategories` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `subcategories`
--
ALTER TABLE `subcategories`
  ADD CONSTRAINT `subcategories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
