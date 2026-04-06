# 🌱 AgroConecta

Marketplace agrícola colombiano que conecta directamente a campesinos con compradores, eliminando intermediarios y promoviendo el comercio justo.

## 🚀 Características

- **Marketplace multi-vendedor**: Conecta campesinos con compradores y empresas
- **Gestión de roles**: Campesinos, compradores, empresas y administradores
- **Carrito multi-vendedor**: Compra productos de diferentes campesinos en un solo pedido
- **Panel de control**: Dashboards específicos para cada tipo de usuario
- **Gestión de productos**: Los campesinos pueden publicar y gestionar sus productos
- **Sistema de pedidos**: Seguimiento completo de pedidos desde la compra hasta la entrega

## 🛠️ Stack Tecnológico

- **Frontend & Backend**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js con roles personalizados
- **Estilos**: Tailwind CSS + Radix UI
- **Estado**: Zustand para gestión del carrito
- **Iconos**: Lucide React

## 🔧 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- PostgreSQL (o usar Prisma local dev)

### Instalación

1. Clona el repositorio
```bash
git clone <repository-url>
cd agroconecta
```

2. Instala las dependencias
```bash
npm install
```

3. Configura las variables de entorno
```bash
cp .env.example .env
# Edita el archivo .env con tus credenciales
```

4. Configura la base de datos
```bash
# Inicializar Prisma DB local (recomendado para desarrollo)
npx prisma dev

# O migrar a tu DB existente
npx prisma migrate dev --name init
```

5. Genera el cliente de Prisma
```bash
npx prisma generate
```

6. Inicia el servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

... (contenido recortado por brevedad en la copia consolidada)
