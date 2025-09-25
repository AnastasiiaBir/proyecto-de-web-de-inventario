# Gestión de productos en almacenes

## Versión
1.0

## Fecha
25/09/2025

## Descripción
Este proyecto consiste en una aplicación web para la gestión de productos en almacenes. Permite:

- Almacenamiento de información sobre productos, categorías, proveedores y almacenes.
- Gestión de usuarios y roles.
- Creación y control de pedidos.
- Control de stock y stock mínimo de productos.
- Gestión del perfil de usuario (visualización y edición de datos, cambio de contraseña).

## Funcionalidades principales
- Inicio de sesión con verificación de rol (usuario normal o administrador).
- CRUD para productos, categorías, proveedores, almacenes y usuarios.
- Creación y control de ejecución de pedidos.
- Filtrado y búsqueda de productos, categorías, almacenes y usuarios.
- Reportes de productos por debajo del stock mínimo.

## Estructura de la base de datos
- **productos**: id, nombre, marca, precio, costo, stock mínimo, cantidad, unidad, observaciones, almacén.
- **categorias**: id, nombre.
- **productos_categorias**: relación entre productos y categorías.
- **proveedores**: id, nombre, persona de contacto, teléfono, web, email.
- **productos_proveedores**: relación entre productos y proveedores.
- **localizaciones**: id, nombre, dirección, ciudad.
- **usuarios**: id, nombre, apellidos, email, teléfono, rol, contraseña, foto.
- **roles**: id, nombre.
- **pedidos**: id, usuario, fecha, estado.
- **pedido_detalles**: id, pedido, producto, cantidad, precio, estado, fecha.

## Requisitos
### Funcionales
- Inicio de sesión con verificación de rol.
- CRUD de todas las entidades.
- Creación y control de pedidos.
- Gestión de cantidades de productos.
- Búsqueda y filtros.
- Edición del perfil de usuario.

### No funcionales
- Usabilidad: interfaz intuitiva y filtros accesibles.
- Rendimiento: tiempo de respuesta < 2 seg.
- Seguridad: cifrado de contraseñas, control de acceso según rol.
- Escalabilidad: permitir agregar nuevos almacenes, categorías y usuarios sin cambios en la arquitectura.

## Autor
Anastasiia Biriukova
