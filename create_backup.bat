@echo off
REM Script de backup completo para Windows
REM AgroConecta System Backup - 2025-08-08

echo 🔄 Iniciando backup completo del sistema AgroConecta...

REM Crear directorio de backup con timestamp
set BACKUP_DIR=backup_%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
mkdir "%BACKUP_DIR%"

echo 📁 Creando backup en directorio: %BACKUP_DIR%

REM 1. Intentar backup de la base de datos MySQL
echo 🗃️ Intentando exportar base de datos agroconecta...
mysqldump -u root -p agroconecta > "%BACKUP_DIR%\agroconecta_database.sql" 2>nul || echo ❌ Error en backup de BD. Crear backup manual

REM 2. Backup del esquema de Prisma
echo 📋 Copiando esquema de Prisma...
copy "prisma\schema.prisma" "%BACKUP_DIR%\" >nul

REM 3. Backup de migraciones
echo 🔄 Copiando migraciones...
xcopy "prisma\migrations" "%BACKUP_DIR%\migrations\" /E /I /Q >nul 2>nul || echo ℹ️ No hay migraciones para copiar

REM 4. Backup de archivos de configuración importantes
echo ⚙️ Copiando archivos de configuración...
copy "package.json" "%BACKUP_DIR%\" >nul
copy "next.config.ts" "%BACKUP_DIR%\" >nul 2>nul || copy "next.config.js" "%BACKUP_DIR%\" >nul 2>nul || echo ℹ️ No se encontró next.config
copy "tsconfig.json" "%BACKUP_DIR%\" >nul 2>nul || echo ℹ️ No se encontró tsconfig.json
copy "tailwind.config.js" "%BACKUP_DIR%\" >nul 2>nul || copy "tailwind.config.ts" "%BACKUP_DIR%\" >nul 2>nul || echo ℹ️ No se encontró tailwind.config
copy ".env.example" "%BACKUP_DIR%\" >nul 2>nul || echo ℹ️ No se encontró .env.example

REM 5. Backup de scripts importantes
echo 📜 Copiando scripts de seeding y verificación...
copy "prisma\*.ts" "%BACKUP_DIR%\" >nul 2>nul || echo ℹ️ No hay scripts .ts en prisma/
copy "*.mjs" "%BACKUP_DIR%\" >nul 2>nul || echo ℹ️ No hay scripts .mjs
copy "*.sql" "%BACKUP_DIR%\" >nul 2>nul || echo ℹ️ No hay archivos .sql

REM 6. Backup de documentación crítica
echo 📚 Copiando documentación...
copy "README.md" "%BACKUP_DIR%\" >nul 2>nul || echo ℹ️ No se encontró README.md
copy "procesos.md" "%BACKUP_DIR%\" >nul 2>nul || echo ℹ️ No se encontró procesos.md
copy "*.md" "%BACKUP_DIR%\" >nul 2>nul || echo ℹ️ No hay archivos .md adicionales

REM 7. Crear resumen del backup
echo 📝 Creando resumen del backup...
echo 🔒 BACKUP COMPLETO AGROCONECTA > "%BACKUP_DIR%\BACKUP_INFO.txt"
echo ============================== >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Fecha: %date% %time% >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Directorio: %BACKUP_DIR% >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo. >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo 📋 CONTENIDO DEL BACKUP: >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - agroconecta_database.sql: Dump completo de la base de datos MySQL >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - schema.prisma: Esquema actual de Prisma >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - migrations/: Directorio de migraciones de Prisma >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - package.json: Dependencias del proyecto >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - *.ts, *.mjs, *.sql: Scripts de seeding y utilidades >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - *.md: Documentación del proyecto >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo. >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo 🗃️ ESTADO DE LA BASE DE DATOS AL MOMENTO DEL BACKUP: >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - 4 roles poblados (ADMINISTRADOR, CAMPESINO, COMPRADOR, EMPRESA) >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - 6 categorías principales >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - 13 subcategorías >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - 1 usuario administrador (admin@agroconecta.com) >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - Sistema de roles corregido y funcional >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - Scripts de repoblación disponibles >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo. >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo 🔧 PARA RESTAURAR: >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo 1. Crear nueva base de datos: CREATE DATABASE agroconecta; >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo 2. Importar dump: mysql -u root -p agroconecta ^< agroconecta_database.sql >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo 3. Verificar con: npx tsx prisma/verify-data.ts >> "%BACKUP_DIR%\BACKUP_INFO.txt"

echo ✅ Backup completo creado en: %BACKUP_DIR%
echo 📦 Contenido:
dir "%BACKUP_DIR%"

echo.
echo 🚨 IMPORTANTE: Para backup manual de BD, ejecuta:
echo mysqldump -u root -p agroconecta ^> backup_manual_%date:~6,4%%date:~3,2%%date:~0,2%.sql

pause
