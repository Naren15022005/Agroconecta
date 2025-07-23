# AgroConecta - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Context
AgroConecta is an agricultural marketplace platform that connects farmers (campesinos) directly with buyers (users and companies), eliminating intermediaries and facilitating fair trade of Colombian agricultural products.

## Architecture
- **Frontend & Backend**: Next.js 14 with App Router and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with role-based access
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: Zustand for cart and app state

## User Roles
1. **Campesino (Farmer)**: Can publish and manage their agricultural products
2. **Empresa (Company)**: Can browse and purchase products in bulk
3. **Comprador (General Buyer)**: Can browse and purchase products
4. **Administrador (Admin)**: Can manage users, products, categories, and system settings

## Key Features
- Multi-vendor shopping cart
- Product catalog with filtering and search
- Order management system
- Role-based dashboards
- Real-time stock verification
- Admin panel for system management

## Code Standards
- Use TypeScript for all components and utilities
- Follow Next.js 14 App Router conventions
- Use Tailwind CSS for styling
- Implement proper error handling and loading states
- Use Prisma for all database operations
- Implement proper authentication checks for protected routes
- Follow RESTful API conventions for API routes

## Database Schema Focus
- Users with role enumeration
- Products linked to farmers
- Categories for product organization
- Orders with line items (multi-vendor support)
- Shopping cart functionality

When generating code, prioritize security, scalability, and user experience appropriate for agricultural marketplace users, including those with limited technical experience.
