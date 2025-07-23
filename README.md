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

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   └── auth/          # Endpoints de autenticación
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboards por rol
│   ├── productos/         # Catálogo de productos
│   └── page.tsx           # Página principal
├── components/            # Componentes reutilizables
├── lib/                   # Librerías y configuraciones
│   ├── auth.ts           # Configuración NextAuth
│   └── prisma.ts         # Cliente Prisma
├── store/                 # Stores de Zustand
│   └── cart.ts           # Store del carrito
└── types/                 # Definiciones de tipos
    └── next-auth.d.ts    # Tipos extendidos de NextAuth
```

## 👥 Roles de Usuario

### 🚜 Campesino
- Publicar y gestionar productos agrícolas
- Ver pedidos recibidos
- Actualizar inventario y precios
- Gestionar perfil y datos de contacto

### 🛒 Comprador
- Explorar catálogo de productos
- Agregar productos al carrito
- Realizar pedidos
- Seguimiento de pedidos

### 🏢 Empresa
- Compra en volumen
- Gestión de pedidos empresariales
- Reportes de compras
- Contacto directo con campesinos

### ⚙️ Administrador
- Gestión completa de usuarios
- Administración de productos y categorías
- Moderación de contenido
- Reportes y estadísticas del sistema

## 🗄️ Base de Datos

El proyecto utiliza PostgreSQL con Prisma ORM. El esquema incluye:

- **Users**: Usuarios con roles diferenciados
- **Products**: Productos agrícolas con categorías
- **Categories**: Categorización de productos
- **Cart**: Sistema de carrito multi-vendedor
- **Orders**: Gestión de pedidos y seguimiento
- **OrderItems**: Items individuales de cada pedido

## 🔐 Autenticación

NextAuth.js con autenticación por credenciales y soporte para:
- Registro por tipo de usuario
- Login seguro con bcrypt
- Sesiones JWT
- Protección de rutas por rol

## 🛡️ Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linter ESLint
npm run prisma:dev   # Prisma development server
npm run prisma:generate # Generar cliente Prisma
npm run prisma:migrate  # Ejecutar migraciones
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📧 Contacto

AgroConecta - Conectando el campo colombiano
- Website: [agroconecta.co](http://agroconecta.co)
- Email: contacto@agroconecta.co

---

**Hecho con ❤️ para el campo colombiano** 🇨🇴
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
