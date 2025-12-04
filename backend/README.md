## Backend

### Requisitos

- Node.js 18 o superior
- PostgreSQL accesible con la cadena de conexion definida en `.env`

### Scripts utiles

- `npm run dev`: prepara el entorno (instala dependencias, corre migraciones) y levanta el servidor en modo desarrollo.
- `npm run start`: ejecuta la API con `ts-node-dev` asumiendo que las dependencias ya estan instaladas.
- `npm run demo`: igual que `dev` pero incluye el seed de datos de ejemplo.
- `npm run build`: transpila TypeScript a `dist/`.

### Endpoints clave - Sprint 2

#### Autenticacion

- **POST `/api/auth/login`**  
  Valida credenciales, genera JWT (con expiracion configurable via `JWT_EXPIRES_IN`) y devuelve `{ token, user }`.
- **GET `/api/auth/me`**  
  Requiere `Authorization: Bearer <token>`. Retorna `{ id, name, email, role }` del usuario autenticado.

#### Usuarios

- **POST `/api/users`**  
  Registro publico. Siempre guarda el rol `CUSTOMER`, ignorando cualquier `role` recibido.
- **PUT `/api/users/:id/role`**  
  Requiere rol `ADMIN`. Permite asignar `ADMIN`, `SELLER` o `CUSTOMER`.

#### Productos

- **GET `/api/products`**  
  Lista paginada. Query params:
  - `page` (default 1)  
  - `limit` (default 10, max 100)  
  - `sortBy` (id, name, price_cents, createdAt)  
  - `order` (asc|desc)  
  - `includeInactive` (true|false)  
  Devuelve productos activos salvo que `includeInactive=true`. Cada item incluye `price_cents` / `is_active` y los alias `price` / `isActive` para el panel.
- **GET `/api/products/:id`**  
  Requiere `ADMIN` o `SELLER`. Devuelve el detalle completo (mismo shape que la lista).
- **POST `/api/products`**  
  Requiere `ADMIN` o `SELLER`. Valida `name`, `stock >= 0` y `price` (o `price_cents`). Responde `201` con el producto creado.
- **PUT `/api/products/:id`**  
  Requiere `ADMIN` o `SELLER`. Actualiza nombre, precio, stock e `is_active`.
- **DELETE `/api/products/:id`**  
  Requiere `ADMIN` o `SELLER`. Responde `204` si elimina; `404` si el ID no existe.

> Los scripts de seed (`scripts/seed.js` o `src/seed.ts`) crean los usuarios `cliente@demo.com` (CUSTOMER) y `vendedor@tienda.com` (SELLER) con contrasena `secret12` y `password123` respectivamente.

### Pruebas manuales sugeridas

1. **Login como cliente demo**  
   `POST /api/auth/login` con `cliente@demo.com / secret12`. Guardar el `token`.
2. **Consultar `/auth/me`**  
   `GET /api/auth/me` con `Authorization: Bearer <token>` para confirmar los datos basicos.
3. **Registro publico**  
   `POST /api/users` sin token. Revisar que el nuevo usuario tenga rol `CUSTOMER`.
4. **Cambiar rol**  
   `PUT /api/users/:id/role` con token admin. Probar que sin token retorna `401` y con rol `CUSTOMER` devuelve `403`.
5. **Crear producto**  
   `POST /api/products` con token `ADMIN` o `SELLER`. Confirmar `201` y que el objeto incluya los alias `price` / `isActive`.
6. **Editar producto**  
   `PUT /api/products/:id` modificando nombre, stock o estado. Validar que `GET /api/products/:id` refleja los cambios.
7. **Eliminar producto**  
   `DELETE /api/products/:id` con token valido. Repetir con un ID inexistente para comprobar el `404`.

### Variables de entorno relevantes

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pyme"
JWT_SECRET="mysecret"
JWT_EXPIRES_IN="1h"
CORS_ORIGIN="http://localhost:5173"
CORS_CREDENTIALS="false"
```

`CORS_ORIGIN` acepta lista separada por comas y `CORS_CREDENTIALS` habilita o no el envio de cookies y encabezados sensibles.

