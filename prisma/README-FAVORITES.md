Para añadir la tabla `favorites` (modelo `Favorite`) se añadió el modelo al `schema.prisma`.

Para aplicar el cambio en la base de datos ejecuta (en local):

```bash
npx prisma migrate dev --name add-favorites
# o si usas producción con despliegue de migraciones:
# npx prisma migrate deploy
```

Luego regenerar el cliente Prisma si es necesario:

```bash
npx prisma generate
```

Nota: haz copia de seguridad de la base de datos antes de correr migraciones en producción.