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

... (contenido recortado por brevedad en la copia consolidada)
