# Busqueda y filtros (tarea 10)

Este documento resume la configuracion de busqueda y filtros. Sin tildes.

## Optimizacion con pg_trgm

- Migracion SQL habilita `pg_trgm` e indices GIN en `Product.name` y `Product.description`.
- Archivo: `backend/prisma/migrations/20251102_pg_trgm_search/migration.sql`
- Estos indices aceleran consultas `ILIKE` o `contains` de Prisma (ej. `%q%`).

## Parametros soportados en GET /api/products

- `page` (>=1), `limit` (1..100)
- `sortBy`: `id|name|price_cents|createdAt`, `order`: `asc|desc`
- `q`: texto de busqueda (name contiene, case-insensitive)
- `categoryId` o `categorySlug`
- `minPrice`, `maxPrice` (enteros >=0)
- `color`, `brand` (coincidencia exacta case-insensitive)
- `includeInactive`: incluye inactivos si es `true`

Reglas:

- Si `minPrice` y `maxPrice` se envian, `minPrice` debe ser <= `maxPrice` (sino 400).

## Ejemplos

```
/api/products?q=mouse&minPrice=5000&maxPrice=30000&sortBy=price_cents&order=asc&page=1&limit=12
/api/products?categorySlug=ultrabooks&sortBy=createdAt&order=desc
/api/products?q=laptop&brand=orion
```

## Notas

- `price_cents` en este proyecto representa el valor CLP entero. Los filtros `minPrice`/`maxPrice` se comparan contra ese valor.
- El endpoint `/api/products/suggestions` usa nombre contiene `q` (case-insensitive).

