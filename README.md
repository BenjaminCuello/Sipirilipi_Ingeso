# E-commerce Pyme - Gestion de productos y ventas

Proyecto academico para construir un sistema **e-commerce local** orientado a una **pyme de venta de articulos de computacion**.  
Incluye **backend, frontend y base de datos** con funcionalidades completas de catalogo, carrito, checkout, reportes y gestion administrativa.

---

## Objetivo del sistema

El sistema busca profesionalizar la gestion de la pyme mediante:

- **Catalogo publico** con busqueda y filtros por categoria.
- **Cuentas y roles**: admin, vendedor (dueno) y cliente.
- **Backoffice (admin/vendedor)**: CRUD de productos y categorias, gestion de stock, fotos, precios y descripciones.
- **Carrito y checkout (cliente)**: agregar, editar, quitar productos, validar stock, pago simulado y registro de pago.
- **Reportes (vendedor)**: ventas por mes, top productos y stock bajo umbral.
- **Tickets de cambio**: apertura dentro de 10 dias con numero de pedido, productos y motivo.

---

## Tecnologias

### Backend

- **Node.js + Express + TypeScript**
- **Prisma** (ORM) + **PostgreSQL**
- **Auth**: JWT + bcrypt
- **Validacion**: Zod
- **Seguridad**: Helmet, CORS, express-rate-limit
- **Imagenes**: multer + sharp (carpeta `uploads/`)
- **Logs**: pino o winston

### Frontend

- **React + Vite + TypeScript**
- **React Router**, **React Query**
- **React Hook Form** + Zod
- **Tailwind CSS**
- **Recharts** (graficos)
- **Zustand** (estado ligero)

### Base de datos / entorno

- **PostgreSQL** (Windows o Docker)
- Extension recomendada: **pg_trgm** (busqueda por texto)
- Seeds/backups: `pg_dump` / `pg_restore`

---

## Modulos principales

- **Auth y usuarios**: registro, login, hash de contrasenas, emision y refresco de JWT, middleware de roles.
- **Catalogo**: categorias, productos, imagenes, busqueda y filtros; paginacion y orden.
- **Carrito y checkout**: carrito por usuario, validacion de stock, creacion de orden y pago simulado.
- **Ordenes y pagos**: flujo `pending -> paid` con pago simulado, registro en `payments`, decremento de stock atomico.
- **Reportes**: ventas por mes, top productos, stock bajo umbral.
- **Tickets de cambio**: creacion y gestion con ventana de 10 dias desde la fecha de la orden.

---

## Flujo de interaccion

### Cliente no autenticado

- Navega catalogo -> busca y filtra -> ve detalle de producto -> agrega al carrito (local o asociado al usuario si ya esta autenticado).

### Autenticacion

- Login -> la API emite JWT -> el frontend guarda la sesion -> se habilitan rutas privadas segun el rol.

---

## Como probar (demo local)

Requisitos:

- Node.js 18+
- PostgreSQL local

### 1. Backend

En una terminal:

```bash
cd backend
npm install
npm run dev
```

La API queda disponible en `http://localhost:4000/api`.

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5173/`.

### 3. Flujos rapidos

- Catalogo publico (home): `http://localhost:5173/`
- Login: `http://localhost:5173/login`
- Panel de administracion / vendedor: `http://localhost:5173/panel/products`

---

## Credenciales demo (usuarios de prueba)

Los scripts de seed (`backend/scripts/seed.js` o `backend/src/seed.ts`) crean automaticamente los siguientes usuarios de ejemplo:

- **Admin**
  - Email: `admin@tienda.com`
  - Contrasena: `admin123`
- **Vendedor**
  - Email: `vendedor@tienda.com`
  - Contrasena: `password123`
- **Clientes**
  - Email: `cliente@demo.com` / Contrasena: `secret12`
  - Email: `cliente2@demo.com` / Contrasena: `secret12`
  - Email: `cliente3@demo.com` / Contrasena: `secret12`
  - Email: `cliente4@demo.com` / Contrasena: `secret12`

Estos usuarios estan pensados solo para la demo y ambiente local.

---

## Ejecucion con Docker (demo)

Requisitos:

- Docker Desktop (o motor Docker) + Docker Compose v2

Desde la raiz del proyecto:

```bash
docker compose up --build
```

Servicios expuestos:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api`
- PostgreSQL: `localhost:5432` (usuario `postgres`, password `postgres`, base `pyme`)

El contenedor del backend ejecuta automaticamente las migraciones (`prisma migrate dev`) y el seed con los usuarios demo descritos en la seccion anterior.

Para detener todo:

```bash
docker compose down
```

Si quieres comenzar desde cero (reiniciar datos):

```bash
docker compose down -v
```

---

## Desarrollo con Docker (hot reload)

Si quieres trabajar desde Docker con recarga en vivo (sin instalar Node ni PostgreSQL localmente), usa:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Los cambios en el codigo se reflejan inmediatamente tanto en backend como en frontend.

---

## Entorno de produccion (Docker)

Se incluye un flujo de construccion multi-stage para el backend, optimizado para entornos de produccion.

- Archivo principal: `backend/Dockerfile.prod`
- Estrategia:
  1. **Builder stage**: instala dependencias y compila TypeScript a JavaScript (`/dist`).
  2. **Runner stage**: genera una imagen ligera (por ejemplo Alpine) que contiene solo dependencias de produccion y el codigo compilado, sin el codigo fuente original ni herramientas de desarrollo.

Ejemplo de comando:

```bash
docker compose -f docker-compose.prod.yml up --build
```

---

## Resumen rapido para el equipo

1. Clonar el repo.
2. Elegir una de estas opciones de ejecucion:
   - **Local**: instalar dependencias (`npm install`) y usar `npm run dev` en backend y frontend con PostgreSQL local.
   - **Docker demo**: `docker compose up --build` para la version compilada lista para demo.
   - **Docker dev**: `docker compose -f docker-compose.dev.yml up --build` para trabajar con hot reload sin dependencias locales.
3. Usar las **credenciales demo**:
   - Admin: `admin@tienda.com / admin123`
   - Vendedor: `vendedor@tienda.com / password123`
   - Clientes: `cliente@demo.com`, `cliente2@demo.com`, `cliente3@demo.com`, `cliente4@demo.com` (todas con `secret12`)

Con cualquiera de los modos, el backend ejecuta migraciones y seed automaticamente al iniciar.

