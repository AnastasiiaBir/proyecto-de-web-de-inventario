-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 20, 2025 at 03:34 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inventario`
--

-- --------------------------------------------------------

--
-- Table structure for table `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`) VALUES
(1, 'Flores de interior'),
(2, 'Flores de jardín2'),
(3, 'Plantas aromáticas'),
(4, 'Suculentas'),
(5, 'Bulbos');

-- --------------------------------------------------------

--
-- Table structure for table `localizaciones`
--

CREATE TABLE `localizaciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `ciudad` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `localizaciones`
--

INSERT INTO `localizaciones` (`id`, `nombre`, `direccion`, `ciudad`) VALUES
(1, 'Almacén Principal', 'Ronda La Sagrera 1', 'Valencia'),
(2, 'Vivero Barcelona', 'Carrer de les Flors 123', 'Barcelona'),
(3, 'Tienda Central', 'Plaça de Catalunya 5', 'Barcelona');

-- --------------------------------------------------------

--
-- Table structure for table `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('pendiente','completado') DEFAULT 'pendiente',
  `trabajo` enum('en_trabajo','finalizado') DEFAULT 'en_trabajo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pedidos`
--

INSERT INTO `pedidos` (`id`, `usuario_id`, `fecha`, `estado`, `trabajo`) VALUES
(1, 2, '2025-09-03 22:13:42', 'completado', 'en_trabajo'),
(2, 2, '2025-09-04 22:27:06', 'pendiente', 'en_trabajo');

-- --------------------------------------------------------

--
-- Table structure for table `pedido_detalles`
--

CREATE TABLE `pedido_detalles` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `producto_nombre` varchar(150) NOT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS (`cantidad` * `precio_unitario`) STORED,
  `cantidad` int(11) NOT NULL,
  `estado` enum('pendiente','confirmado') DEFAULT 'pendiente',
  `fecha` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pedido_detalles`
--

INSERT INTO `pedido_detalles` (`id`, `pedido_id`, `usuario_id`, `producto_id`, `producto_nombre`, `marca`, `precio_unitario`, `cantidad`, `estado`, `fecha`) VALUES
(1, 1, 2, 1, 'Rosa Roja', 'FloraPlus', 6.00, 4, 'confirmado', '2025-09-04 00:13:42'),
(2, 1, 2, 2, 'Tulipán Amarillo', 'GardenCo', 5.50, 1, 'confirmado', '2025-09-04 00:22:25'),
(3, 2, 2, 4, 'Cactus Mini2', 'FloraPlus', 7.00, 2, 'pendiente', '2025-09-05 00:27:06');

-- --------------------------------------------------------

--
-- Table structure for table `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `categoría` varchar(50) NOT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `stock_minimo` int(11) DEFAULT NULL,
  `cantidad` varchar(15) NOT NULL,
  `localizacion_id` int(11) DEFAULT NULL,
  `medida` varchar(50) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `marca`, `categoría`, `precio`, `costo`, `stock_minimo`, `cantidad`, `localizacion_id`, `medida`, `stock`, `observaciones`) VALUES
(1, 'Rosa Roja', 'FloraPlus', '', 6.00, 3.00, 10, '', 1, 'tallo', 30, NULL),
(2, 'Tulipán Amarillo', 'GardenCo', '', 5.50, 2.50, 10, '', 2, 'maceta 10cm', 20, NULL),
(3, 'Lavanda', 'SeedMasters', '', 5.00, 2.50, 5, '', 2, 'maceta 10cm', 30, 'Aroma relajante'),
(4, 'Cactus Mini2', 'FloraPlus', '', 7.00, 3.50, 3, '', 3, 'maceta 5cm', 20, 'Suculenta resistente'),
(5, 'Lirio Blanco', 'GardenCo', '', 4.50, 2.00, 8, '', 1, 'tallo', 60, 'Perfecto para jardines');

-- --------------------------------------------------------

--
-- Table structure for table `productos_categorias`
--

CREATE TABLE `productos_categorias` (
  `producto_id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productos_categorias`
--

INSERT INTO `productos_categorias` (`producto_id`, `categoria_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 2);

-- --------------------------------------------------------

--
-- Table structure for table `productos_proveedores`
--

CREATE TABLE `productos_proveedores` (
  `producto_id` int(11) NOT NULL,
  `proveedor_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productos_proveedores`
--

INSERT INTO `productos_proveedores` (`producto_id`, `proveedor_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 1),
(5, 2);

-- --------------------------------------------------------

--
-- Table structure for table `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `contacto` varchar(200) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `web` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proveedores`
--

INSERT INTO `proveedores` (`id`, `nombre`, `contacto`, `telefono`, `web`, `email`) VALUES
(1, 'FloraPlus', 'Ana Martínez', '912345678', 'https://floraplus.com', 'contacto@floraplus.com'),
(2, 'GardenCo', 'Laura Gómez', '987654321', 'https://gardenco.com', 'info@gardenco.com'),
(3, 'SeedMasters\r\n', 'Emmeta Minguez', '987654321', 'https://seedmasters.com', 'info@seedmasters.com');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `nombre`) VALUES
(1, 'Administrador'),
(2, 'Usuario');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) NOT NULL,
  `expires` bigint(20) UNSIGNED NOT NULL,
  `data` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('ftw9nORDMCT6tKHcHcWchQIBf9BRr3tk', 1759433060, '{\"cookie\":{\"originalMaxAge\":3600000,\"expires\":\"2025-10-02T19:23:14.800Z\",\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"id\":1,\"nombre\":\"Admin4\",\"apellidos\":\"Principal\",\"email\":\"admin@empresa.com\",\"rol_id\":1,\"telefono\":\"1234567890\",\"foto\":\"/uploads/admin_1.jpg\"}}');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellidos` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol_id` int(11) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `foto` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellidos`, `email`, `telefono`, `rol_id`, `password`, `foto`) VALUES
(1, 'Admin4', 'Principal', 'admin@empresa.com', '1234567890', 1, '$2b$10$xajRxJvOeGs0OfpluSsh/Og60HP.L/wmN99m54M5L9yThfc46Wc.6', '/uploads/admin_1.jpg'),
(2, 'Juan', 'Pérez', 'juan@example.com', '987654321', 2, '$2b$10$nEiOF1mt0iGCGFhJuJisbeg.amp3eyPndoFUSPNjXY0mI9EqSINvW', '/uploads/user_2.png');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `localizaciones`
--
ALTER TABLE `localizaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indexes for table `pedido_detalles`
--
ALTER TABLE `pedido_detalles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pedido_id` (`pedido_id`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_producto_id` (`producto_id`);

--
-- Indexes for table `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `localizacion_id` (`localizacion_id`);

--
-- Indexes for table `productos_categorias`
--
ALTER TABLE `productos_categorias`
  ADD PRIMARY KEY (`producto_id`,`categoria_id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indexes for table `productos_proveedores`
--
ALTER TABLE `productos_proveedores`
  ADD PRIMARY KEY (`producto_id`,`proveedor_id`),
  ADD KEY `proveedor_id` (`proveedor_id`);

--
-- Indexes for table `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `rol_id` (`rol_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `localizaciones`
--
ALTER TABLE `localizaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pedido_detalles`
--
ALTER TABLE `pedido_detalles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Constraints for table `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`localizacion_id`) REFERENCES `localizaciones` (`id`);

--
-- Constraints for table `productos_categorias`
--
ALTER TABLE `productos_categorias`
  ADD CONSTRAINT `productos_categorias_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `productos_categorias_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);

--
-- Constraints for table `productos_proveedores`
--
ALTER TABLE `productos_proveedores`
  ADD CONSTRAINT `productos_proveedores_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `productos_proveedores_ibfk_2` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`);

--
-- Constraints for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
