# AgroConecta — Documento de Flujos, Features y Estado del Sistema

> **Fecha de generación:** 5 de marzo de 2026  
> **Stack principal:** Next.js 15 (App Router + Turbopack) · TypeScript · Prisma ORM · MySQL · NextAuth.js (JWT) · Zustand · Tailwind CSS · Lucide Icons

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Arquitectura Técnica](#2-arquitectura-técnica)
3. [Base de Datos (Prisma Schema)](#3-base-de-datos-prisma-schema)
4. [Roles y Permisos](#4-roles-y-permisos)
5. [Autenticación y Seguridad](#5-autenticación-y-seguridad)
6. [Flujos del Sistema](#6-flujos-del-sistema)
   - 6.1 [Registro y Activación de Cuenta](#61-registro-y-activación-de-cuenta)
   - 6.2 [Inicio de Sesión (Login)](#62-inicio-de-sesión-login)
   - 6.3 [Recuperación de Contraseña](#63-recuperación-de-contraseña)
   - 6.4 [Publicación de Productos (Agricultor)](#64-publicación-de-productos-agricultor)
   - 6.5 [Catálogo y Mercado (Comprador)](#65-catálogo-y-mercado-comprador)
   - 6.6 [Carrito de Compras](#66-carrito-de-compras)
   - 6.7 [Checkout y Creación de Pedidos](#67-checkout-y-creación-de-pedidos)
   - 6.8 [Gestión de Pedidos (Agricultor)](#68-gestión-de-pedidos-agricultor)
   - 6.9 [Mis Pedidos (Comprador)](#69-mis-pedidos-comprador)
   - 6.10 [Sistema de Pagos](#610-sistema-de-pagos)
   - 6.11 [Billetera del Agricultor](#611-billetera-del-agricultor)
   - 6.12 [Favoritos](#612-favoritos)
   - 6.13 [Notificaciones](#613-notificaciones)
   - 6.14 [Panel de Administración](#614-panel-de-administración)
7. [API Routes — Mapa Completo](#7-api-routes--mapa-completo)
8. [Frontend — Páginas y Componentes](#8-frontend--páginas-y-componentes)
9. [Módulos Backend (Clean Architecture)](#9-módulos-backend-clean-architecture)
10. [Estado Actual — Porcentaje de Avance](#10-estado-actual--porcentaje-de-avance)
11. [Lo que Falta para Finalizar](#11-lo-que-falta-para-finalizar)

---

## 1. Visión General

**AgroConecta** es un marketplace agrícola colombiano que conecta campesinos (agricultores) directamente con compradores y empresas, eliminando intermediarios y facilitando el comercio justo de productos agrícolas.

### Objetivo principal
Permitir que los agricultores publiquen sus productos con información completa (fotos, certificaciones, métodos de entrega, presentaciones/unidades de compra), y que los compradores puedan explorar el catálogo, agregar al carrito multi-vendor, hacer checkout con múltiples métodos de pago, y realizar seguimiento de sus pedidos.

### Usuarios del sistema
| Rol | Descripción |
|-----|-------------|
| **CAMPESINO** (Agricultor) | Publica productos, gestiona pedidos recibidos, ve estadísticas y billetera |
| **COMPRADOR** | Navega el mercado, agrega a carrito, compra, gestiona pedidos y favoritos |
| **EMPRESA** | Similar al comprador pero orientado a compras al por mayor |
| **ADMINISTRADOR** | Dashboard financiero, gestión de usuarios, validación de pagos, billetera global |

---

## 2. Arquitectura Técnica

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                     │
│  Next.js App Router · Tailwind CSS · Zustand · Lucide   │
├───────────────┬─────────────┬────────────────────────────┤
│  /comprador   │ /agricultor │        /admin              │
│  Layout propio│ NavMenu     │   Sidebar + Layout         │
├───────────────┴─────────────┴────────────────────────────┤
│                   MIDDLEWARE (NextAuth JWT)               │
│         Protege /admin/* · Verifica roles                │
├──────────────────────────────────────────────────────────┤
│                  API ROUTES (Next.js)                     │
│  /api/auth/*  /api/productos  /api/carrito  /api/pedidos │
│  /api/admin/* /api/agricultor/* /api/comprador/*          │
├──────────────────────────────────────────────────────────┤
│               MODULES (Clean Architecture)               │
│  pedidos/ · carrito/ · productos/ · notificaciones/      │
│  admin/ · agricultor/ · comprador/ · reseñas/            │
│  Cada módulo: controller.ts → service.ts → repository.ts │
├──────────────────────────────────────────────────────────┤
│                  PRISMA ORM (MySQL)                       │
│  25+ modelos · Relaciones completas · Migraciones        │
├──────────────────────────────────────────────────────────┤
│                    MySQL Database                         │
│  Tablas: users, roles, products, orders, order_items,    │
│  cart_items, favorites, wallets, sales, pagos,           │
│  payment_transactions, payment_orders, liquidaciones,    │
│  notifications, comisiones, impuestos, etc.              │
└──────────────────────────────────────────────────────────┘
```

### Librerías principales

| Librería | Uso |
|----------|-----|
| `next` 15.4.3 | Framework fullstack (App Router + Turbopack) |
| `react` 19.1.0 | UI |
| `prisma` 6.12.0 | ORM para MySQL |
| `next-auth` 4.24.11 | Autenticación (JWT + Google OAuth) |
| `zustand` 5.0.6 | Estado global del carrito (persistido en localStorage) |
| `tailwindcss` 4+ | Estilos (tema oscuro) |
| `lucide-react` | Iconografía |
| `bcryptjs` | Hash de contraseñas |
| `nodemailer` | Envío de emails (activación, reset, notificaciones) |
| `uuid` | Generación de IDs únicos |

---

## 3. Base de Datos (Prisma Schema)

### Modelos principales (25+ tablas)

| Modelo | Tabla DB | Descripción |
|--------|----------|-------------|
| `Role` | `roles` | Roles del sistema (CAMPESINO, COMPRADOR, EMPRESA, ADMINISTRADOR) |
| `User` | `users` | Usuarios base con nombre, correo, contraseña hasheada, roleId, isActive |
| `Agricultor` | `agricultores` | Perfil extendido del agricultor (teléfono, ubicación, foto, verificado) |
| `Cliente` | `clientes` | Perfil extendido del comprador |
| `Empresa` | `empresas` | Perfil extendido de empresa (NIT, razón social, logo) |
| `Category` | `categories` | Categorías de productos (Frutas, Tubérculos, Café, etc.) |
| `Subcategory` | `subcategories` | Subcategorías vinculadas a categorías |
| `Product` | `products` | Productos con campos extendidos: imágenes múltiples, purchaseUnits (JSON), certificaciones, métodos de entrega, municipio, vereda, tipo de cultivo |
| `CartItem` | `cart_items` | Ítems del carrito de compras (userId + productId, unique) |
| `Order` | `orders` | Pedidos con status completo, método de entrega, método de pago, archivado, pagoVerificado |
| `OrderItem` | `order_items` | Líneas del pedido (producto, cantidad, precio, subtotal) |
| `PaymentTransaction` | `payment_transactions` | Transacciones de pago por pedido (comprobante, estado) |
| `PaymentOrder` | `payment_orders` | Órdenes de pago al agricultor (monto bruto, comisión, neto) |
| `Liquidacion` | `liquidaciones` | Liquidaciones periódicas a agricultores |
| `Wallet` | `wallets` | Billetera digital de cada usuario |
| `WalletTransaction` | `wallet_transactions` | Movimientos de billetera (income, expense) |
| `Sale` | `sales` | Registro de ventas (vendedor ↔ comprador) |
| `Comision` | `comisiones` | Comisiones por venta |
| `Impuesto` | `impuestos` | Impuestos aplicados a ventas |
| `Pago` | `pagos` | Pagos registrados por el usuario |
| `WithdrawRequest` | `withdraw_requests` | Solicitudes de retiro de fondos |
| `Transaccion` | `transacciones` | Transacciones genéricas |
| `Notification` | `notifications` | Notificaciones en tiempo real |
| `Favorite` | `favorites` | Productos favoritos del comprador (userId + productId, unique) |
| `Account` | `accounts` | Cuentas OAuth (Google) vinculadas |
| `Session` | `sessions` | Sesiones de usuario |
| `VerificationToken` | `verification_tokens` | Tokens de activación y reset de contraseña |

### Enums

| Enum | Valores |
|------|---------|
| `ProductStatus` | DISPONIBLE, AGOTADO, SUSPENDIDO |
| `TipoCultivo` | ORGANICO, CONVENCIONAL |
| `OrderStatus` | PENDIENTE, CONFIRMADO, EN_PREPARACION, EN_CAMINO, EN_PUNTO, ENTREGADO, CANCELADO, NO_ENTREGADO |
| `DeliveryMethod` | ENTREGA_DIRECTA, PUNTO_ENCUENTRO, REPARTIDOR_ALIADO, EMPRESA_TRANSPORTADORA |
| `PaymentMethod` | TRANSFERENCIA, NEQUI, PASARELA, MERCADOPAGO |
| `PaymentOrderState` | PENDIENTE, PAGADO_INDIVIDUAL, PAGADO_MASIVO, REEMBOLSADO, BLOQUEADO |
| `TipoPago` | INDIVIDUAL, MASIVO |

### Sistema de IDs personalizados

Se usa la clase `AgroConectaIdGenerator` para generar IDs legibles:
- Usuarios: `AGRC_USER_<ROLE>_<timestamp+random>` (ej: `AGRC_USER_AGRICULTOR_MLE1AS4P13XF`)
- Productos: `AGRC_PRD_<timestamp+random>`
- Pedidos: `AGRC_ORD_<timestamp+random>`
- Categorías: `AGRC_CAT_<nombre>` (ej: `AGRC_CAT_FRUTAS`)
- Subcategorías: `AGRC_SUB_<nombre>`

---

## 4. Roles y Permisos

### Matriz de permisos

| Funcionalidad | CAMPESINO | COMPRADOR | EMPRESA | ADMIN |
|--------------|:---------:|:---------:|:-------:|:-----:|
| Publicar productos | ✅ | ❌ | ❌ | ❌ |
| Editar/eliminar mis productos | ✅ | ❌ | ❌ | ✅ |
| Ver catálogo/mercado | ✅ | ✅ | ✅ | ✅ |
| Agregar al carrito | ✅* | ✅ | ✅ | ❌ |
| Hacer checkout | ✅* | ✅ | ✅ | ❌ |
| Aceptar/rechazar pedidos | ✅ | ❌ | ❌ | ❌ |
| Gestionar estado de pedidos | ✅ | ❌ | ❌ | ✅ |
| Cancelar mis pedidos | ❌ | ✅ | ✅ | ❌ |
| Ver billetera | ✅ | ❌ | ❌ | ✅ |
| Ver estadísticas propias | ✅ | ❌ | ❌ | ✅ |
| Gestionar favoritos | ❌ | ✅ | ✅ | ❌ |
| Dashboard admin | ❌ | ❌ | ❌ | ✅ |
| CRUD usuarios | ❌ | ❌ | ❌ | ✅ |
| Validar pagos | ❌ | ❌ | ❌ | ✅ |
| Gestionar categorías | ❌ | ❌ | ❌ | ✅ |

> *CAMPESINO puede comprar productos de otros agricultores, pero NO sus propios productos.

### Middleware de protección

- `/admin/*` → protegido por middleware: requiere JWT con `role === 'ADMINISTRADOR'`
- `/agricultor/*` → protegido en el layout: redirige si el rol no es CAMPESINO
- `/comprador/*` → protegido en el layout: redirige si el rol no es COMPRADOR/EMPRESA (el mercado es público)
- Cada API route verifica la sesión con `getServerSession(authOptions)`

---

## 5. Autenticación y Seguridad

### Proveedores de autenticación
1. **Credenciales** (email + contraseña) — proveedor principal
2. **Google OAuth** — flujo de vinculación si ya existe cuenta con el mismo correo

### Flujo JWT
```
Login → authorize() verifica bcrypt → genera JWT → 
  jwt callback: asigna role, id, remember → 
  session callback: normaliza id, expone role → 
  Cookie set con maxAge dinámico (30d o 90d si "Recordarme")
```

### Seguridad implementada
- ✅ Contraseñas hasheadas con `bcrypt` (salt rounds: 10)
- ✅ Validación de contraseña robusta (`validatePassword` en `lib/password.ts`)
- ✅ Tokens de verificación para activación de cuenta (1h expiry)
- ✅ Tokens de reset de contraseña (1h expiry)
- ✅ Sesiones JWT con expiración configurable
- ✅ Refresco de rol desde DB en cada request (protege contra roles stale)
- ✅ Normalización de IDs legacy en JWT callback
- ✅ Rate limiting implícito por diseño de NextAuth
- ✅ Validación de email en registro (regex)
- ✅ Usuarios requieren activación (`isActive: false` por defecto)
- ✅ Google OAuth con flujo de vinculación de cuentas existentes

---

## 6. Flujos del Sistema

### 6.1 Registro y Activación de Cuenta

```
Usuario → /auth/registro → Formulario (nombre, correo, contraseña, rol)
  ↓
POST /api/auth/register
  ↓
Validaciones (campos, email, contraseña, rol existe en DB)
  ↓
Crear User (isActive: false) + perfil según rol (Agricultor/Cliente/Empresa)
  ↓
Generar VerificationToken (1h expiry)
  ↓
Enviar email de activación via SMTP (nodemailer)
  ↓
Usuario click en link → GET /api/auth/activar?token=xxx
  ↓
Activar usuario (isActive: true) + eliminar token
  ↓
Redirect a /auth/signin
```

**Archivos clave:**
- `src/app/auth/registro/page.tsx` + `RegisterClient.tsx`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/activar/route.ts`
- `src/app/auth/activar/page.tsx` + `[token]/page.tsx`
- `src/lib/email.ts` (envío SMTP)

### 6.2 Inicio de Sesión (Login)

```
Usuario → /auth/signin → Formulario (email, contraseña, recordarme)
  ↓
NextAuth authorize() → busca user por correo → bcrypt.compare()
  ↓
JWT callback: asigna id, role, exp según "remember"
  ↓
Session callback: normaliza id, expone role
  ↓
Redirect según rol:
  - CAMPESINO → /agricultor
  - COMPRADOR/EMPRESA → /comprador
  - ADMINISTRADOR → /admin
```

**Archivos clave:**
- `src/app/auth/signin/page.tsx` + `SignInClient.tsx`
- `src/lib/auth.ts` (NextAuth config)
- `src/app/auth/redirect/page.tsx` (smart redirect post-login)

### 6.3 Recuperación de Contraseña

```
Usuario → /auth/forgot → ingresa email
  ↓
POST /api/auth/forgot → genera VerificationToken → envía email con link
  ↓
Click en link → /auth/reset/[token] → formulario nueva contraseña
  ↓
POST /api/auth/reset → valida token, hashea nueva contraseña, actualiza user
```

### 6.4 Publicación de Productos (Agricultor)

```
Agricultor → /agricultor/publicar → Formulario extenso:
  - Nombre, descripción, precio, unidad base
  - Categoría + subcategoría (cargadas desde API)
  - Stock, stock mínimo
  - Fecha de cosecha, tiempo de entrega
  - Certificaciones (selección múltiple)
  - Métodos de entrega (domicilio, punto, finca, mercado)
  - Unidades de compra personalizadas (PackagingModal)
  - Hasta 6+ imágenes (upload base64 o multipart)
  - Municipio, vereda, tipo de cultivo
  - Horarios, notas especiales
  ↓
Upload de imágenes → POST /api/upload (guarda en /public/uploads/productos/)
  ↓
POST /api/productos → Crea Product en DB con todos los campos
  ↓
Redirect a /agricultor/mis-productos
```

**Campos del producto almacenados:**
- Datos básicos: `name`, `description`, `price`, `stock`, `unit`, `imageUrl`
- Galería: `imagenes` (JSON array de URLs)
- Categorización: `categoryId`, `subcategoryId`, `tipoCultivo`
- Logística: `metodosEntrega`, `horariosDisponibles`, `tiempoEntrega`, `municipio`, `vereda`
- Calidad: `certificaciones` (JSON array), `pesoAproximado`
- Presentaciones: `purchaseUnits` (JSON array de `{unit, equivalencia, price}`)

### 6.5 Catálogo y Mercado (Comprador)

```
Comprador → /comprador/mercado → ProductosCatalogo component
  ↓
GET /api/productos → Carga todos los productos activos con categoría + agricultor
  ↓
Se muestran en grid/lista con:
  - Imagen principal
  - Nombre, precio, unidad
  - Badge de presentaciones disponibles
  - Nombre del agricultor + ubicación
  - Botón ❤️ para favoritos
  - Botón "Comprar Ahora" (agrega al carrito y abre sidebar)
  ↓
Filtros disponibles:
  - Por categoría
  - Por búsqueda (nombre, descripción, agricultor, ubicación)
  - Por ciudad
  - Ordenar: recientes, precio asc/desc, rating
  ↓
Click en producto → Router push a /mercado/producto/[id] (vista detalle)
```

**Archivos clave:**
- `src/app/comprador/mercado/page.tsx`
- `src/components/ProductosCatalogo.tsx` (componente principal del catálogo)
- `src/components/ProductoDetalleModal.tsx`
- `src/app/mercado/producto/[id]/page.tsx` (vista detalle completa)

### 6.6 Carrito de Compras

```
Estado global (Zustand, persistido en localStorage):
  - items: CartItem[] (id, name, price, quantity, stock, unit, purchaseUnit, campesinoId, campesinoName, imageUrl, metodosEntrega)
  - isOpen: boolean
  - addItem() / removeItem() / updateQuantity() / clearCart()
  - getTotalItems() / getTotalPrice()
  - getItemsByVendor() → agrupa por campesinoId (multi-vendor)
  - toggleCart() → abre/cierra sidebar

Sidebar del carrito:
  - CartSidebar component (renderizado en layout global)
  - Muestra ítems agrupados por agricultor
  - Botón para ir al checkout

Protecciones:
  - Agricultor NO puede comprar sus propios productos (verificación client + server)
  - Cantidad limitada por stock real
  - Validación de producto real (formato ID AGRC_PRD_*)
```

**Archivos clave:**
- `src/store/cart.ts` (Zustand store)
- `src/components/CartSidebar.tsx`
- `src/components/MiniCart.tsx`
- `src/store/useCleanInvalidCartItems.ts`

### 6.7 Checkout y Creación de Pedidos

```
Comprador → /comprador/checkout → Proceso en 3 pasos:

Paso 1 - Entrega:
  - Seleccionar método de entrega (según métodos del agricultor)
  - RECOGER_FINCA, MERCADO_LOCAL, COURIER, TRANSPORTADORA
  - Dirección, teléfono, fecha, hora, instrucciones

Paso 2 - Pago:
  - TRANSFERENCIA: datos bancarios + subir comprobante
  - NEQUI: datos + subir comprobante
  - MERCADOPAGO: integración con pasarela
  ↓
POST /api/carrito/checkout
  ↓
Server-side:
  - Verifica sesión
  - Valida items (no vacíos, productoIds válidos)
  - Verifica que agricultor no compre su propio producto
  - Agrupa por agricultor (multi-vendor → 1 pedido por agricultor)
  - Valida stock de cada producto
  - Crea Order + OrderItems
  - Si pago requiere validación → pagoVerificado: false + PaymentTransaction PENDIENTE
  - Decrementa stock de cada producto
  - Crea notificación para el agricultor
  ↓
Return { ok: true, pedidos: [...] }

Paso 3 - Confirmación:
  - Resumen del pedido creado
  - Limpieza del carrito
```

**Archivos clave:**
- `src/app/comprador/checkout/page.tsx` (779 líneas — checkout completo)
- `src/app/api/carrito/checkout/route.ts`
- `src/modules/notificaciones/repository.ts`

### 6.8 Gestión de Pedidos (Agricultor)

```
Agricultor → /agricultor/pedidos → Dos tabs:

Tab "Recibidos" (PedidosPorAceptar):
  - Lista de pedidos en estado PENDIENTE
  - Botón "Aceptar" → PATCH /api/pedidos { action: "confirmar" }
    - Valida que el agricultor sea dueño de los productos
    - Verifica stock disponible (stock - reservedStock)
    - Cambia estado a CONFIRMADO
    - Reserva stock (incrementa reservedStock)
    - Envía email al comprador
    - Crea notificación
  - Botón "Rechazar" → PATCH /api/pedidos { status: "CANCELADO" }

Tab "Gestión" (PedidosCrudGestion):
  - Lista de pedidos ya aceptados (CONFIRMADO, EN_PREPARACION, EN_CAMINO, etc.)
  - Click → PedidoDetalleModal
  - Cambios de estado:
    - CONFIRMADO → EN_PREPARACION → EN_CAMINO → ENTREGADO
    - Cada cambio: PATCH /api/pedidos con nuevo status
    - Email al comprador en cada cambio
    - Notificación creada

Flujo completo de estados:
  PENDIENTE → CONFIRMADO → EN_PREPARACION → EN_CAMINO → ENTREGADO
                                                        → NO_ENTREGADO
           → CANCELADO (por agricultor o comprador)
```

**Polling**: La página hace fetch cada 3 segundos para actualizar pedidos en tiempo real.

**Archivos clave:**
- `src/app/agricultor/pedidos/page.tsx`
- `src/components/PedidosPorAceptar.tsx`
- `src/components/PedidosCrudGestion.tsx`
- `src/components/PedidoDetalleModal.tsx`
- `src/app/api/pedidos/route.ts` (509 líneas — lógica completa de PATCH)
- `src/app/api/agricultor/pedidos/route.ts`
- `src/app/api/agricultor/pedidos/[id]/estado/route.ts`

### 6.9 Mis Pedidos (Comprador)

```
Comprador → /comprador/pedidos
  ↓
GET /api/pedidos?buyerId=<userId>
  ↓
Muestra lista con:
  - Estado visual (badge con color)
  - Productos del pedido
  - Total, método de pago, método de entrega
  - Datos del agricultor
  - Filtros: por estado, por fecha
  - Acción: Cancelar pedido (si status permite)
```

### 6.10 Sistema de Pagos

```
Flujo de validación de pagos:

Comprador hace checkout con TRANSFERENCIA/NEQUI:
  → Pago queda como PENDIENTE (pagoVerificado: false)
  → Se crea PaymentTransaction con estado PENDIENTE
  → Comprador sube comprobante

Admin → /admin/validaciones-pagos:
  - Tab "Validación": Lista de pagos pendientes
    - Ver comprobante (imagen modal)
    - PATCH /api/admin/pagos-validaciones { pedidoId, pagoVerificado: true }
    - Actualiza Order.pagoVerificado + PaymentTransaction.estado
  - Tab "Dashboard": Resumen rápido de pagos

MercadoPago (pasarela):
  POST /api/pagos/mercadopago → Crea preferencia de pago en MercadoPago
  → Redirect a checkout de MercadoPago
  → Callback con resultado
  → Actualiza pedido automáticamente
```

### 6.11 Billetera del Agricultor

```
Agricultor → /agricultor/billetera
  ↓
GET /api/agricultor/billetera
  ↓
Muestra:
  - Saldo disponible
  - Total ventas del mes (bruto y neto)
  - Total ingresos acumulados
  - Comisión de la plataforma
  - Pedidos completados
  - Pagos recibidos (lista + detalles)
  - Historial de transacciones de billetera
  - Pendiente de liquidación

Modelo financiero:
  - PaymentOrder: registra monto bruto, comisión plataforma, monto neto por agricultor
  - Liquidacion: pago agrupado al agricultor
  - Wallet + WalletTransaction: balance y movimientos
  - Comision + Impuesto: vinculados a cada Sale
```

### 6.12 Favoritos

```
Comprador → Click ❤️ en ProductosCatalogo o ProductoDetalleModal
  ↓
POST /api/comprador/favoritos { productId } → Crea Favorite
DELETE /api/comprador/favoritos?productId=xxx → Elimina Favorite
  ↓
/comprador/favoritos → Página dedicada
  - Muestra tarjetas completas (misma UI que el catálogo)
  - Imagen grande, nombre, precio, unidad
  - Agricultor + ubicación
  - Botón ❤️ rojo para quitar de favoritos
  - Botón "Comprar Ahora" que agrega al carrito
  ↓
GET /api/comprador/favoritos → Lista favoritos con product incluido
```

### 6.13 Notificaciones

```
Sistema de notificaciones internas:

Creación automática:
  - Nuevo pedido → notificación al agricultor
  - Cambio de estado → notificación al comprador

API: /api/notificaciones
  - GET ?userId=xxx → listar notificaciones del usuario
  - POST → crear notificación
  - PATCH → marcar como leída
  - DELETE → eliminar notificación

Frontend:
  - NotificacionFlotante component
  - Badge counter en NavMenu (pedidos pendientes para agricultor)
  - Página /agricultor/notificaciones
```

### 6.14 Panel de Administración

```
Admin → /admin → Dashboard principal

Dashboard (/admin):
  - Cards de métricas: Total recaudado, Ganancia AgroConecta, A pagar a agricultores,
    Pedidos realizados, Ventas realizadas, Comisiones totales
  - Tabla de pagos a agricultores
  - Panel de actividad reciente
  - Acciones rápidas (billetera, validaciones, pagos)

Secciones del panel:
┌──────────────────┬────────────────────────────────────────┐
│ /admin/productos │ CRUD de productos del sistema          │
│ /admin/agricultores │ Gestión de agricultores y perfiles │
│ /admin/usuarios  │ CRUD de usuarios (activar/desactivar) │
│ /admin/pedidos   │ Vista global de todos los pedidos      │
│ /admin/pagos     │ Gestión completa de pagos              │
│ /admin/validaciones│ Validar comprobantes de pago         │
│ /admin/billetera │ Billetera financiera global            │
└──────────────────┴────────────────────────────────────────┘

API endpoints del admin:
  - GET /api/admin/dashboard → resumen financiero completo
  - GET/PATCH /api/admin/usuarios → listar/editar usuarios
  - DELETE /api/admin/usuarios/[id] → eliminar usuario
  - GET /api/admin/pedidos → todos los pedidos + stats
  - GET/PATCH /api/admin/pagos-validaciones → validar pagos
  - GET /api/admin/billetera → datos financieros globales
  - GET /api/admin/payment-orders → órdenes de pago
  - POST /api/admin/backup → crear respaldo del sistema
  - GET /api/admin/productos/stats → estadísticas de productos
```

---

## 7. API Routes — Mapa Completo

### Autenticación (`/api/auth/`)
| Ruta | Métodos | Descripción |
|------|---------|-------------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handler (login, session, etc.) |
| `/api/auth/register` | POST | Registro de nuevo usuario |
| `/api/auth/activar` | GET, POST | Activar cuenta con token |
| `/api/auth/activate/[token]` | GET | Activar cuenta (URL directa) |
| `/api/auth/check-activation` | GET | Verificar estado de activación |
| `/api/auth/forgot` | POST | Solicitar reset de contraseña |
| `/api/auth/reset` | POST | Ejecutar reset de contraseña |
| `/api/auth/link-account` | POST | Vincular cuenta Google con existente |

### Productos (`/api/productos/`)
| Ruta | Métodos | Descripción |
|------|---------|-------------|
| `/api/productos` | GET, POST | Listar productos / Crear producto |
| `/api/productos/[id]` | GET, PUT, DELETE | Detalle / Actualizar / Eliminar producto |
| `/api/categorias` | GET | Listar categorías activas |
| `/api/subcategorias` | GET | Listar subcategorías |
| `/api/upload` | POST | Upload de imágenes (base64 o multipart) |

### Carrito y Checkout (`/api/carrito/`)
| Ruta | Métodos | Descripción |
|------|---------|-------------|
| `/api/carrito` | GET, POST, PUT, DELETE, PATCH | CRUD del carrito |
| `/api/carrito/checkout` | POST | Crear pedido(s) multi-vendor |

### Pedidos (`/api/pedidos/`)
| Ruta | Métodos | Descripción |
|------|---------|-------------|
| `/api/pedidos` | GET, PATCH | Listar pedidos / Cambiar estado |

### Agricultor (`/api/agricultor/`)
| Ruta | Métodos | Descripción |
|------|---------|-------------|
| `/api/agricultor` | GET | Datos del agricultor autenticado |
| `/api/agricultor/pedidos` | GET | Pedidos recibidos por el agricultor |
| `/api/agricultor/pedidos/[id]/estado` | PATCH | Cambiar estado de pedido |
| `/api/agricultor/productos` | GET, POST, PUT, DELETE | CRUD productos del agricultor |
| `/api/agricultor/perfil` | GET, PUT | Ver/editar perfil agricultor |
| `/api/agricultor/billetera` | GET | Datos financieros del agricultor |
| `/api/agricultor/por-user` | GET | Obtener perfil agricultor por userId |

### Comprador (`/api/comprador/`)
| Ruta | Métodos | Descripción |
|------|---------|-------------|
| `/api/comprador` | GET | Datos del comprador autenticado |
| `/api/comprador/favoritos` | GET, POST, DELETE | CRUD favoritos |

### Pagos (`/api/pagos/`)
| Ruta | Métodos | Descripción |
|------|---------|-------------|
| `/api/pagos` | — | (placeholder) |
| `/api/pagos/[id]` | GET, PATCH | Detalle/actualizar pago |
| `/api/pagos/mercadopago` | POST | Crear preferencia MercadoPago |

### Admin (`/api/admin/`)
| Ruta | Métodos | Descripción |
|------|---------|-------------|
| `/api/admin/dashboard` | GET | Resumen financiero completo |
| `/api/admin/usuarios` | GET, PATCH | Listar/editar usuarios |
| `/api/admin/usuarios/[id]` | DELETE, PATCH | Eliminar/editar usuario |
| `/api/admin/agricultores/[id]` | GET, PATCH | Detalle/editar agricultor |
| `/api/admin/pedidos` | GET | Todos los pedidos |
| `/api/admin/pedidos/stats` | GET | Estadísticas de pedidos |
| `/api/admin/pagos` | GET | Gestión de pagos |
| `/api/admin/pagos-validaciones` | GET, PATCH | Validar comprobantes |
| `/api/admin/pagos/procesar` | POST | Procesar pagos |
| `/api/admin/pagos/resumen` | GET | Resumen de pagos |
| `/api/admin/pagos/resumen/comprobante` | GET | Comprobantes |
| `/api/admin/payment-orders` | GET | Órdenes de pago |
| `/api/admin/productos/stats` | GET | Stats de productos |
| `/api/admin/billetera` | GET | Billetera admin |
| `/api/admin/billetera/summary` | GET | Resumen billetera |
| `/api/admin/backup` | POST | Crear backup |

### Otros
| Ruta | Métodos | Descripción |
|------|---------|-------------|
| `/api/notificaciones` | GET, POST, PATCH, DELETE | CRUD notificaciones |
| `/api/debug/*` | GET | Endpoints de depuración (auth, session, etc.) |

---

## 8. Frontend — Páginas y Componentes

### Páginas por rol

#### Público / Auth
| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/auth/signin` | Login (credenciales + Google) |
| `/auth/registro` | Registro con selección de rol |
| `/auth/forgot` | Recuperar contraseña |
| `/auth/reset/[token]` | Restablecer contraseña |
| `/auth/activar` | Activar cuenta |
| `/auth/activar/[token]` | Activación directa |
| `/auth/link` | Vincular Google con cuenta existente |
| `/auth/error` | Página de error de auth |
| `/mercado` | Mercado público |
| `/mercado/producto/[id]` | Detalle de producto |

#### Comprador (`/comprador/`)
| Ruta | Descripción |
|------|-------------|
| `/comprador` | Home del comprador |
| `/comprador/mercado` | Catálogo con filtros, búsqueda, favoritos |
| `/comprador/carrito` | Vista del carrito |
| `/comprador/checkout` | Proceso de checkout (3 pasos) |
| `/comprador/pedidos` | Mis pedidos con filtros |
| `/comprador/favoritos` | Productos favoritos (tarjetas completas) |

#### Agricultor (`/agricultor/`)
| Ruta | Descripción |
|------|-------------|
| `/agricultor` | Home del agricultor |
| `/agricultor/dashboard` | Dashboard |
| `/agricultor/mercado` | Catálogo (puede explorar pero no comprar sus propios) |
| `/agricultor/publicar` | Formulario de publicación de productos (extenso) |
| `/agricultor/mis-productos` | CRUD de productos propios (1618 líneas — muy completo) |
| `/agricultor/pedidos` | Gestión de pedidos recibidos (tabs: recibidos/gestión) |
| `/agricultor/billetera` | Billetera financiera (304 líneas) |
| `/agricultor/estadisticas` | Dashboard de estadísticas |
| `/agricultor/perfil` | Editar perfil (foto, teléfono, ubicación, etc.) |
| `/agricultor/notificaciones` | Centro de notificaciones |

#### Admin (`/admin/`)
| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard principal con métricas financieras |
| `/admin/login` | Login de admin |
| `/admin/register` | Registro de admin |
| `/admin/productos` | Gestión de productos |
| `/admin/agricultores` | Gestión de agricultores |
| `/admin/usuarios` | CRUD de usuarios |
| `/admin/pedidos` | Todos los pedidos del sistema |
| `/admin/pagos` | Gestión financiera de pagos |
| `/admin/validaciones-pagos` | Validar comprobantes de pago |
| `/admin/billetera` | Billetera global |

### Componentes reutilizables

| Componente | Descripción |
|------------|-------------|
| `ProductosCatalogo` | Catálogo de productos con grid/lista, filtros, favoritos, toast (757 líneas) |
| `ProductoDetalleModal` | Modal de detalle de producto |
| `CartSidebar` | Sidebar del carrito (global) |
| `MiniCart` | Mini carrito flotante |
| `NavMenu` | Menú de navegación del agricultor con polling de pedidos |
| `PedidosPorAceptar` | Lista de pedidos pendientes de aceptar |
| `PedidosCrudGestion` | Tabla de gestión de pedidos |
| `PedidoDetalleModal` | Modal con detalle de pedido y cambio de estado |
| `PedidosRecibidosTable` | Tabla de pedidos recibidos |
| `PedidosAgricultorSPA` | SPA de pedidos del agricultor |
| `BilleteraAgricultor` | Componente de billetera |
| `PagosAdminPanel` | Panel de pagos del admin |
| `PagosByAgricultor` | Pagos agrupados por agricultor |
| `LiquidacionModal` | Modal de liquidación de pagos |
| `PackagingModal` | Modal para agregar presentaciones/unidades de compra |
| `NotificacionFlotante` | Notificaciones flotantes |
| `CitySelector` | Selector de ciudad (búsqueda) |
| `BrandIcon` | Ícono/logo de AgroConecta |
| `CategoryCard` | Tarjeta de categoría |
| `Modal` | Modal genérico reutilizable |
| `Toast` | Toast notifications |
| `LoadingDots` / `LoadingModal` | Indicadores de carga |
| `StatusModals` | Modales de estado |
| `ColorPaletteTable` | Tabla de paleta de colores del diseño |
| `SignInClient` | Componente de login |
| `RegisterClient` | Componente de registro con flujo completo |
| `RegistrationFlowModal` | Modal de flujo de registro |
| `LinkAccountClient` | Vinculación de cuentas |
| `StakeholderSelect` | Selector de tipo de usuario en registro |
| `ActivatedLogin` | Login post-activación |

---

## 9. Módulos Backend (Clean Architecture)

El backend usa una arquitectura modular con separación de capas:

```
src/modules/
├── admin/          → controller.ts · service.ts · repository.ts · handler.ts
├── agricultor/     → controller.ts · service.ts · repository.ts · handler.ts
├── carrito/        → controller.ts · service.ts · repository.ts · handler.ts
├── comprador/      → controller.ts · service.ts · repository.ts · handler.ts
├── notificaciones/ → controller.ts · service.ts · repository.ts · handler.ts
├── pedidos/        → controller.ts · service.ts · repository.ts · handler.ts
├── productos/      → controller.ts · service.ts · repository.ts · handler.ts
└── reseñas/        → controller.ts · repository.ts · service.ts (vacío/scaffold)
```

**Patrón de cada módulo:**
```
handler.ts → recibe NextRequest, valida auth, delega a controller
controller.ts → orquesta la lógica, llama al servicio
service.ts → reglas de negocio
repository.ts → operaciones Prisma (DB)
```

---

## 10. Estado Actual — Porcentaje de Avance

### Resumen global: **~72% completado**

| Área | Avance | Notas |
|------|:------:|-------|
| **Autenticación** | 95% | Login, registro, activación, reset, Google OAuth, JWT, roles — todo funcional. Falta: OAuth con más proveedores (opcional) |
| **Registro & Activación** | 95% | Completo con emails. Falta: mejorar UX de reenvío de token |
| **Catálogo de Productos** | 90% | Grid/lista, filtros, búsqueda, presentaciones, galería multi-imagen. Falta: paginación, búsqueda avanzada |
| **Publicación de Productos** | 90% | Formulario extenso (800+ líneas), upload múltiple, categorías, certificaciones. Falta: edición inline más fluida |
| **Carrito Multi-vendor** | 90% | Zustand persistido, agrupado por agricultor, validaciones de stock, sidebar global. Falta: sincronización server-side |
| **Checkout** | 85% | 3 pasos (entrega, pago, confirmación), multi-vendor, comprobantes. Falta: refinar UX en móvil, más métodos de pago |
| **Gestión de Pedidos (Agricultor)** | 85% | Dos tabs, cambio de estado, emails, notificaciones, polling. Falta: filtros avanzados, exportar datos |
| **Mis Pedidos (Comprador)** | 80% | Lista con filtros, cancelación. Falta: seguimiento en tiempo real más visual, reordenar |
| **Sistema de Pagos** | 75% | Transferencia, Nequi, MercadoPago integrado, validación admin, comprobantes. Falta: más pasarelas, webhooks MercadoPago robustos |
| **Billetera del Agricultor** | 80% | Saldo, ventas, comisiones, transacciones, pagos recibidos. Falta: solicitudes de retiro funcionales, historial completo |
| **Favoritos** | 85% | API completa, UI con tarjetas, toggle desde catálogo y detalle. Falta: contador en header |
| **Notificaciones** | 70% | CRUD API, notificación automática en pedidos, polling, badge. Falta: WebSockets/SSE para tiempo real, notificaciones push |
| **Panel Admin** | 75% | Dashboard financiero, gestión usuarios/productos/pedidos, validaciones. Falta: reportes exportables, gráficas interactivas, logs de auditoría |
| **Perfil Agricultor** | 85% | Edición completa (nombre, foto, teléfono, ubicación, descripción). Falta: verificación de identidad |
| **Perfil Comprador/Empresa** | 50% | Modelo en DB, creación automática en registro. Falta: página de edición de perfil |
| **Reseñas** | 5% | Módulo scaffolded (archivos vacíos). Falta: implementación completa |
| **Testing** | 10% | Setup configurado (Vitest + Playwright). Falta: escribir tests unitarios e E2E |
| **Responsividad / Mobile** | 70% | Tailwind responsive, sidebar colapsable. Falta: testing exhaustivo en móvil, PWA |
| **Emails transaccionales** | 75% | Activación, reset, cambio de estado de pedido vía SMTP. Falta: templates más profesionales, email de bienvenida completo |
| **Internacionalización** | 0% | Todo en español. Si se necesita i18n, falta implementar |
| **SEO / Meta tags** | 20% | Layout básico. Falta: meta tags dinámicos, Open Graph, sitemap |
| **Despliegue / CI-CD** | 15% | Scripts de backup creados. Falta: Dockerfile, CI/CD pipeline, variables de entorno en producción |

---

## 11. Lo que Falta para Finalizar

### Alta prioridad (necesario para MVP funcional)

| # | Feature | Esfuerzo estimado |
|---|---------|:-----------------:|
| 1 | **Perfil del comprador/empresa** — página de edición (`/comprador/perfil`) con teléfono, dirección, preferencias | 2-3 días |
| 2 | **Webhooks MercadoPago** — confirmar pago automáticamente cuando MercadoPago notifica | 2-3 días |
| 3 | **Solicitudes de retiro (Agricultor)** — flujo completo de withdraw desde billetera | 3-4 días |
| 4 | **Paginación en catálogo y listas** — actualmente se cargan todos los productos de una vez | 1-2 días |
| 5 | **Notificaciones en tiempo real** — reemplazar polling por WebSockets o SSE | 3-5 días |
| 6 | **Tests E2E y unitarios** — al menos flujos críticos (registro, checkout, pagos) | 5-7 días |
| 7 | **Manejo de errores global** — error boundaries, fallbacks consistency | 2-3 días |

### Prioridad media (mejoras significativas)

| # | Feature | Esfuerzo estimado |
|---|---------|:-----------------:|
| 8 | **Sistema de reseñas** — implementar módulo completo (calificación por producto + agricultor) | 4-5 días |
| 9 | **Búsqueda avanzada** — full-text search, filtros combinados, geolocalización | 3-4 días |
| 10 | **Reportes exportables (Admin)** — CSV/PDF de ventas, pedidos, pagos | 2-3 días |
| 11 | **Gráficas interactivas (Admin/Agricultor)** — charts con Recharts o Chart.js | 3-4 días |
| 12 | **Email templates profesionales** — diseño HTML responsive para todos los emails | 2-3 días |
| 13 | **Verificación de agricultor** — flujo con documentos, aprobación admin | 3-4 días |
| 14 | **Chat entre comprador y agricultor** — mensajería interna básica | 5-7 días |

### Baja prioridad (nice-to-have, post-MVP)

| # | Feature | Esfuerzo estimado |
|---|---------|:-----------------:|
| 15 | **PWA (Progressive Web App)** — instalable, notificaciones push | 3-4 días |
| 16 | **Internacionalización (i18n)** — soporte multi-idioma | 3-5 días |
| 17 | **SEO avanzado** — meta tags dinámicos, Open Graph, structured data, sitemap | 2-3 días |
| 18 | **CI/CD pipeline** — GitHub Actions, Docker, deploy automático | 3-4 días |
| 19 | **Logs de auditoría** — registro de todas las acciones administrativas | 2-3 días |
| 20 | **Programa de fidelización** — puntos por compra, descuentos | 4-5 días |
| 21 | **API pública / documentación** — Swagger/OpenAPI para integraciones | 2-3 días |
| 22 | **Modo offline** — Service Worker con cache de catálogo | 3-4 días |
| 23 | **Multi-moneda / Facturación electrónica** — cumplimiento DIAN Colombia | 5+ días |
| 24 | **Analytics dashboard** — integración con Google Analytics o propio | 2-3 días |

---

### Desglose de porcentaje por módulo

```
Autenticación & Auth         ██████████████████░░  95%
Productos & Catálogo         █████████████████░░░  90%
Carrito                      █████████████████░░░  90%
Checkout                     ████████████████░░░░  85%
Gestión Pedidos (Agricultor) ████████████████░░░░  85%
Favoritos                    ████████████████░░░░  85%
Perfil Agricultor            ████████████████░░░░  85%
Mis Pedidos (Comprador)      ███████████████░░░░░  80%
Billetera Agricultor         ███████████████░░░░░  80%
Emails Transaccionales       ██████████████░░░░░░  75%
Sistema de Pagos             ██████████████░░░░░░  75%
Panel Admin                  ██████████████░░░░░░  75%
Notificaciones               █████████████░░░░░░░  70%
Responsividad                █████████████░░░░░░░  70%
Perfil Comprador/Empresa     █████████░░░░░░░░░░░  50%
SEO                          ███░░░░░░░░░░░░░░░░░  20%
Despliegue                   ██░░░░░░░░░░░░░░░░░░  15%
Testing                      █░░░░░░░░░░░░░░░░░░░  10%
Reseñas                      ░░░░░░░░░░░░░░░░░░░░   5%
Internacionalización         ░░░░░░░░░░░░░░░░░░░░   0%
─────────────────────────────────────────────────
PROMEDIO PONDERADO GLOBAL    ██████████████░░░░░░  ~72%
```

---

> **Nota:** Este documento fue generado mediante análisis completo del código fuente del proyecto. Los porcentajes son estimaciones basadas en la funcionalidad implementada vs. lo esperado para un marketplace agrícola de producción.
