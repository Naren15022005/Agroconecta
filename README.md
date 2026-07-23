# 🌱 AgroConecta — Documentación General y Estado del Sistema

Marketplace agrícola colombiano que conecta directamente a campesinos/agricultores con compradores y empresas, eliminando intermediarios y promoviendo el comercio justo.

---

## 📊 Nivel de Desarrollo y Estado Actual

**Estado General:** 🚀 **Fase de Integración Avanzada / Pre-Producción (~85%-90% Completado)**

- **Frontend & App Next.js:** 100% funcional con App Router, dashboards dinámicos por rol, catálogo de productos, carrito de compras multi-vendedor y checkout.
- **Base de Datos Principal:** PostgreSQL/MySQL operando con Prisma ORM, datos semilla de roles, categorías y productos cargados.
- **Microservicio Backend & Servicios Cloud:** Servidor Node.js Express configurado e integrado con **Firebase Admin SDK** (Firestore & Auth) y cliente Supabase opcional.
- **Autenticación y Control de Acceso:** NextAuth.js y Firebase Auth con validación de roles en middleware.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
| :--- | :--- |
| **Frontend Framework** | Next.js (App Router), React 19, TypeScript |
| **Estilos & UI** | Tailwind CSS v4, Radix UI, Lucide Icons |
| **Estado Global** | Zustand (Gestión del Carrito Multi-Vendedor) |
| **Autenticación** | NextAuth.js (JWT) + Firebase Auth Integration |
| **Base de Datos Principal** | MySQL / PostgreSQL + Prisma ORM |
| **Microservicio Backend** | Node.js, Express, Firebase Admin SDK (Firestore / Storage) |
| **Emailing** | Nodemailer (SMTP / Gmail) |

---

## ⚡ Módulos y Funcionalidades Totalmente Funcionales

### 👥 1. Sistema de Autenticación y Gestión de Roles
- **4 Roles Definidos:** `CAMPESINO`, `COMPRADOR`, `EMPRESA`, `ADMINISTRADOR`.
- Registro diferencial con validaciones de campos por tipo de usuario.
- Redirección automática según el rol tras el inicio de sesión.
- Middleware con protección de rutas de API y vistas.

### 🚜 2. Panel del Campesino / Agricultor
- Publicación, edición y eliminación de productos agrícolas.
- Gestión de stock, unidades de medida y precios.
- Panel de pedidos recibidos con filtros por estado.
- Estadísticas de ventas y dashboard básico.

### 🛒 3. Marketplace y Carrito Multi-Vendedor
- Catálogo de productos con búsqueda y filtrado por categorías y subcategorías.
- Carrito multi-vendedor (permite agregar productos de distintos campesinos en un único checkout).
- Cálculo dinámico de totales, impuestos y comisiones.
- Seguimiento de pedidos desde el historial del comprador.

### 🏢 4. Panel Empresarial y Comprador
- Vistas especializadas para compras en volumen (B2B).
- Panel de control de compras e historial detallado.

### ⚙️ 5. Panel de Administración (Admin)
- Dashboard global de métricas del sistema.
- Moderación y aprobación de productos/usuarios.
- Gestión de categorías y subcategorías.

### 🔥 6. Microservicio Backend & Firebase Integration
- Servidor independiente Express en `backend/`.
- Conexión configurada con el proyecto de **Firebase (`agroconecta-dev-2026`)**.
- Endpoints para Firestore (`/firebase/products`) y verificación de tokens (`/firebase/verify-token`).
- Integración en Next.js con [`src/lib/firebase.ts`](file:///c:/Users/alfon/OneDrive/Documentos/Proyectos/Agroconecta/src/lib/firebase.ts).

---

## 📁 Estructura del Proyecto

```
Agroconecta/
├── backend/                  # Microservicio Express + Firebase Admin SDK
│   ├── firebase.js           # Inicializador de Firebase (Firestore & Auth)
│   ├── index.js              # Servidor Express y endpoints de API
│   └── package.json
├── prisma/                   # Esquema de DB y scripts de Seeding
│   ├── schema.prisma         # Modelos de Prisma ORM
│   ├── seed.ts               # Poblamiento de datos iniciales
│   └── create-admin.ts       # Script de creación de usuario Administrador
├── src/                      # Aplicación Next.js
│   ├── app/                  # Rutas y Vistas (App Router)
│   │   ├── api/             # API Routes de Next.js
│   │   ├── auth/            # Iniciar Sesión y Registro
│   │   ├── dashboard/       # Dashboards por Rol
│   │   └── productos/       # Catálogo de Productos
│   ├── components/           # Componentes UI reutilizables
│   ├── lib/                  # Librerías (Prisma, Auth, Firebase client, Email)
│   ├── store/                # Estados de Zustand (Cart Store)
│   └── types/                # Tipados TypeScript
├── .env                      # Variables de entorno de Next.js y Firebase Client
└── package.json              # Dependencias del proyecto principal
```

---

## 🚀 Guía de Inicio Rápido

### 1. Iniciar la Aplicación Principal (Next.js)
```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Iniciar servidor de desarrollo
npm run dev
```
La aplicación web estará disponible en [http://localhost:3000](http://localhost:3000).

### 2. Iniciar el Backend Microservicio (Express + Firebase)
```bash
cd backend
npm install
node index.js
```
El servidor escuchará en [http://localhost:10000](http://localhost:10000).

---

## 🔑 Credenciales Administrador de Prueba
- **Email:** `admin@agroconecta.com`
- **Contraseña:** `admin123`
- **Rol:** `ADMINISTRADOR`

---

## 👤 Autor y Contacto
- **GitHub Username:** [Naren15022005](https://github.com/Naren15022005)
- **Correo Electrónico:** [alfonsonavarroch@gmail.com](mailto:alfonsonavarroch@gmail.com)

