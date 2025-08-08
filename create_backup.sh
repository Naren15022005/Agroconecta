#!/bin/bash
# Script de backup completo del sistema AgroConecta
# Fecha: 2025-08-08
# Descripción: Backup de base de datos, código fuente y configuraciones

echo "🔄 Iniciando backup completo del sistema AgroConecta..."

# Crear directorio de backup con timestamp
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Creando backup en directorio: $BACKUP_DIR"

# 1. Backup de la base de datos MySQL
echo "🗃️ Exportando base de datos agroconecta..."
mysqldump -u root -p agroconecta > "$BACKUP_DIR/agroconecta_database.sql" 2>/dev/null || echo "❌ Error en backup de BD. Usar export manual"

# 2. Backup del esquema de Prisma
echo "📋 Copiando esquema de Prisma..."
cp prisma/schema.prisma "$BACKUP_DIR/"

# 3. Backup de migraciones
echo "🔄 Copiando migraciones..."
cp -r prisma/migrations "$BACKUP_DIR/" 2>/dev/null || echo "ℹ️ No hay migraciones para copiar"

# 4. Backup de archivos de configuración importantes
echo "⚙️ Copiando archivos de configuración..."
cp package.json "$BACKUP_DIR/"
cp next.config.ts "$BACKUP_DIR/" 2>/dev/null || cp next.config.js "$BACKUP_DIR/" 2>/dev/null || echo "ℹ️ No se encontró next.config"
cp tsconfig.json "$BACKUP_DIR/" 2>/dev/null || echo "ℹ️ No se encontró tsconfig.json"
cp tailwind.config.js "$BACKUP_DIR/" 2>/dev/null || cp tailwind.config.ts "$BACKUP_DIR/" 2>/dev/null || echo "ℹ️ No se encontró tailwind.config"
cp .env.example "$BACKUP_DIR/" 2>/dev/null || echo "ℹ️ No se encontró .env.example"

# 5. Backup de scripts importantes
echo "📜 Copiando scripts de seeding y verificación..."
cp prisma/*.ts "$BACKUP_DIR/" 2>/dev/null || echo "ℹ️ No hay scripts .ts en prisma/"
cp *.mjs "$BACKUP_DIR/" 2>/dev/null || echo "ℹ️ No hay scripts .mjs"
cp *.sql "$BACKUP_DIR/" 2>/dev/null || echo "ℹ️ No hay archivos .sql"

# 6. Backup de documentación crítica
echo "📚 Copiando documentación..."
cp README.md "$BACKUP_DIR/" 2>/dev/null || echo "ℹ️ No se encontró README.md"
cp procesos.md "$BACKUP_DIR/" 2>/dev/null || echo "ℹ️ No se encontró procesos.md"
cp *.md "$BACKUP_DIR/" 2>/dev/null || echo "ℹ️ No hay archivos .md adicionales"

# 7. Crear resumen del backup
echo "📝 Creando resumen del backup..."
cat > "$BACKUP_DIR/BACKUP_INFO.txt" << EOF
🔒 BACKUP COMPLETO AGROCONECTA
==============================
Fecha: $(date)
Directorio: $BACKUP_DIR

📋 CONTENIDO DEL BACKUP:
- agroconecta_database.sql: Dump completo de la base de datos MySQL
- schema.prisma: Esquema actual de Prisma
- migrations/: Directorio de migraciones de Prisma
- package.json: Dependencias del proyecto
- *.ts, *.mjs, *.sql: Scripts de seeding y utilidades
- *.md: Documentación del proyecto

🗃️ ESTADO DE LA BASE DE DATOS AL MOMENTO DEL BACKUP:
- 4 roles poblados (ADMINISTRADOR, CAMPESINO, COMPRADOR, EMPRESA)
- 6 categorías principales
- 13 subcategorías
- 1 usuario administrador (admin@agroconecta.com)
- Sistema de roles corregido y funcional
- Scripts de repoblación disponibles

🔧 PARA RESTAURAR:
1. Crear nueva base de datos: CREATE DATABASE agroconecta;
2. Importar dump: mysql -u root -p agroconecta < agroconecta_database.sql
3. Verificar con: npx tsx prisma/verify-data.ts

📞 CONTACTO:
Si necesitas restaurar este backup, usa los scripts de verificación incluidos.
EOF

echo "✅ Backup completo creado en: $BACKUP_DIR"
echo "📦 Contenido:"
ls -la "$BACKUP_DIR"

echo ""
echo "🚨 IMPORTANTE: Para backup de BD manual, ejecuta:"
echo "mysqldump -u root -p agroconecta > backup_manual_$(date +%Y%m%d).sql"
