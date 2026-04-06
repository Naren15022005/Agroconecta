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
| **COMPRADOR** | Navega el mercado, agrega al carrito, compra, gestiona pedidos y favoritos |
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

... (contenido recortado por brevedad en la copia consolidada)
