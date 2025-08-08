# 🛡️ BACKUP COMPLETO - AGROCONECTA

**Fecha del backup:** 8 de agosto de 2025  
**Estado:** Base de datos funcionando correctamente con roles corregidos

## 📁 Contenido del Backup

### Archivos de Datos
- `backup_completo_2025-08-08_170657.json` - Backup completo (13.5KB)
  - ✅ 4 roles (ADMINISTRADOR, CAMPESINO, COMPRADOR, EMPRESA)
  - ✅ 6 categorías 
  - ✅ 13 subcategorías
  - ✅ 4 usuarios (incluyendo admin)
  - ✅ 2 productos
  - ✅ 0 pedidos

- `backup_esencial_2025-08-08_170657.json` - Solo datos críticos (7.3KB)
  - ✅ Roles, categorías, subcategorías y usuario admin
  - 🎯 Ideal para restauración rápida después de reset

### Scripts de Backup
- `scripts/seed.ts` - Script original de población de datos
- `scripts/create-admin.ts` - Script para crear usuario administrador
- `scripts/create-backup.ts` - Script para crear nuevos backups
- `scripts/restore-backup.ts` - Script para restaurar desde backup

## 🔧 Cómo Usar

### Para Crear un Nuevo Backup
```bash
npx tsx create-backup.ts
```

### Para Restaurar desde Backup
```bash
# Restauración completa
npx tsx restore-backup.ts backup_completo_2025-08-08_170657.json

# Restauración solo de datos esenciales
npx tsx restore-backup.ts backup_esencial_2025-08-08_170657.json
```

### Para Poblar DB Desde Cero
```bash
# 1. Población básica
npx tsx prisma/seed.ts

# 2. Crear usuario admin
npx tsx prisma/create-admin.ts
```

## 🚨 En Caso de Emergency Reset

Si la base de datos se resetea accidentalmente:

1. **Opción Rápida (recomendada):**
   ```bash
   npx tsx restore-backup.ts backup_esencial_2025-08-08_170657.json
   ```

2. **Opción Manual:**
   ```bash
   npx tsx prisma/seed.ts
   npx tsx prisma/create-admin.ts
   ```

## 👤 Credenciales del Admin
- **Email:** admin@agroconecta.com
- **Password:** admin123

## ✅ Estado del Sistema al Momento del Backup

### Roles Corregidos ✅
Todos los archivos actualizados para usar nombres consistentes:
- Frontend: `StakeholderSelect.tsx` ✅
- Backend: `register/route.ts` ✅
- Middleware: `middleware.ts` ✅ 
- Layouts: `comprador/layout.tsx` ✅
- APIs: Endpoints de agricultor ✅
- Componentes: `ProductosCatalogo.tsx` ✅

### Base de Datos ✅
- Roles poblados correctamente
- Categorías y subcategorías funcionando
- Usuario admin creado y activo
- Productos de prueba disponibles

### Registro Funcionando ✅
El error "El rol seleccionado no es válido" fue corregido.

## 📝 Notas Importantes

- Los backups **NO incluyen contraseñas** por seguridad (marcadas como `[ENCRYPTED]`)
- El script de restauración regenera la contraseña del admin como `admin123`
- Los timestamps en nombres de archivo permiten múltiples versiones
- Siempre hacer backup antes de cambios mayores

---
**🔒 Mantenga este directorio backup/ en un lugar seguro y no lo elimine.**
