## Backend

### Requisitos

- Node.js 18+
- PostgreSQL accesible con la cadena de conexión de `.env`

### Scripts útiles

- `npm run dev` &rarr; Ejecuta el entorno de desarrollo (instala dependencias si faltan, corre migraciones y levanta el server con recarga).
- `npm run demo` &rarr; Prepara un entorno demo (seed incluido) y levanta el server.
- `npm run build` &rarr; Compila a JavaScript (salida en `dist/`).
- `npm run start` &rarr; Arranca el servidor con `ts-node-dev` (requiere haber instalado dependencias previamente).

### Flujos implementados en este sprint

#### Registro público (rol forzado)

- **POST `/api/users`**  
  Crea una cuenta de cliente. El backend fuerza siempre el rol `CUSTOMER`, ignorando cualquier valor `role` que se envíe.  
  **Request**
  ```json
  {
    "name": "Cliente Demo",
    "email": "cliente@example.com",
    "password": "secreto123"
  }
  ```
  **Response 201**
  ```json
  {
    "id": 12,
    "name": "Cliente Demo",
    "email": "cliente@example.com",
    "role": "CUSTOMER",
    "createdAt": "2025-10-16T19:16:08.372Z"
  }
  ```

#### Administración de roles (solo admin)

- **PUT `/api/users/:id/role`**  
  Cambia el rol de un usuario. Requiere header `Authorization: Bearer <token>` con un usuario `ADMIN`.  
  Roles permitidos: `ADMIN`, `SELLER`, `CUSTOMER`.  
  **Request**
  ```json
  {
    "role": "SELLER"
  }
  ```
  **Response 200**
  ```json
  {
    "id": 7,
    "name": "Vendedor",
    "email": "seller@example.com",
    "role": "SELLER",
    "updatedAt": "2025-10-16T19:18:26.966Z"
  }
  ```

#### Gestión de productos (admin | seller)

- **GET `/api/products`**  
  Catálogo público paginado. Parámetros: `page` (1 por defecto) y `limit` (10 por defecto, máximo 100). Solo devuelve productos activos.

- **POST `/api/products`**  
  Crea un producto. Requiere `ADMIN` o `SELLER`. Valida que `name` no sea vacío, `price_cents` y `stock` sean enteros mayores o iguales a 0 e `is_active` opcional (por defecto `true`).  
  **Request**
  ```json
  {
    "name": "Mouse G203",
    "price_cents": 19990,
    "stock": 25,
    "is_active": true
  }
  ```
  **Response 201**
  ```json
  {
    "id": 13,
    "name": "Mouse G203",
    "price_cents": 19990,
    "stock": 25,
    "is_active": true,
    "createdAt": "2025-10-16T19:18:46.903Z",
    "updatedAt": "2025-10-16T19:18:46.903Z"
  }
  ```

- **DELETE `/api/products/:id`**  
  Elimina un producto. Requiere `ADMIN` o `SELLER`. Responde `204 No Content`. Si el producto no existe, devuelve `404`.

### Pruebas manuales sugeridas

1. **Login admin**  
   `POST /api/auth/login` con credenciales de un `ADMIN` (ejemplo de demo: `cliente@demo.com / secret12`). Copiar el token JWT.

2. **Registro público**  
   `POST /api/users` sin header de autorización. Verificar en la base o con `GET /api/users` (usando token admin) que el rol siempre es `CUSTOMER`.

3. **Cambio de rol**  
   `PUT /api/users/:id/role` con token admin y cuerpo `{ "role": "SELLER" }` o el que corresponda. Sin token → `401`. Con token de `CUSTOMER` → `403`.

4. **Crear producto**  
   `POST /api/products` con token `ADMIN`/`SELLER`. Validar que responda 201. Repetir sin token para comprobar `401/403`.

5. **Eliminar producto**  
   `DELETE /api/products/:id` con token `ADMIN`/`SELLER`. Respuesta esperada `204`. Si el id no existe, `404`.

> Se pueden utilizar los comandos `curl` / `Invoke-RestMethod` compartidos en el equipo para reproducir los casos anteriores.
