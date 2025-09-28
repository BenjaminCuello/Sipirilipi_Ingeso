# ðŸ›’ E-commerce Pyme â€” GestiÃ³n de productos y ventas

Proyecto acadÃ©mico para construir un sistema **e-commerce local** orientado a una **pyme de venta de artÃ­culos de computaciÃ³n**.
Incluye **backend, frontend y base de datos** con funcionalidades completas de catÃ¡logo, carrito, checkout, reportes y gestiÃ³n administrativa.

---

## Objetivo del sistema

El sistema busca profesionalizar la gestiÃ³n de la pyme mediante:

- **CatÃ¡logo pÃºblico** con bÃºsqueda y filtros por categorÃ­a.
- **Cuentas y roles**: admin, vendedor (dueÃ±o) y cliente.
- **Backoffice (admin/vendedor)**: CRUD de productos/categorÃ­as, gestiÃ³n de stock, fotos, precios y descripciones.
- **Carrito y checkout (cliente)**: agregar/editar/quitar, validar stock, pago simulado y registro de pago.
- **Reportes (vendedor)**: ventas por mes, top productos y stock bajo umbral.
- **Tickets de cambio**: apertura dentro de 10 dÃ­as con nÃºmero de pedido, productos y motivo.

---

## ðŸ§‘â€ðŸ’» TecnologÃ­as a usar

### Backend

- **Node.js + Express + TypeScript**
- **Prisma** (ORM) + **PostgreSQL**
- **Auth**: JWT + bcrypt
- **ValidaciÃ³n**: Zod
- **Seguridad**: Helmet, CORS, express-rate-limit
- **ImÃ¡genes**: multer + sharp (carpeta `uploads/`)
- **Logs**: pino o winston
- **Docs**: Swagger (OpenAPI) (opcional)

### Frontend

- **React + Vite + TypeScript**
- **React Router**, **React Query**
- **React Hook Form** + Zod
- **Tailwind CSS**
- **Recharts** (grÃ¡ficos)
- **Zustand** (estado ligero)

### Base de datos / entorno

- **PostgreSQL** (Windows)
- ExtensiÃ³n recomendada: **pg_trgm** (bÃºsqueda por texto)
- Seeds/backups: `pg_dump` / `pg_restore`

---

## MÃ³dulos principales de momento

- **Auth & Usuarios**: registro/login, hash de contraseÃ±as, emisiÃ³n/refresco de JWT, middleware de roles.
- **CatÃ¡logo**: categorÃ­as, productos, imÃ¡genes, bÃºsqueda y filtros; paginaciÃ³n y orden.
- **Carrito & Checkout**: carrito por usuario, validaciÃ³n de stock, creaciÃ³n de orden.
- **Ã“rdenes & Pagos**: flujo `pending â†’ paid` con pago simulado, registro en payments, decremento de stock atÃ³mico.
- **Reportes**: ventas por mes, top productos, stock bajo umbral.
- **Tickets de cambio**: creaciÃ³n y gestiÃ³n con ventana de 10 dÃ­as desde la fecha de la orden.

---

## Flujo de interacciÃ³n de momento

### Cliente no autenticado

- Navega catÃ¡logo â†’ busca/filtra â†’ ve detalle producto â†’ agrega al carrito (local o user si ya autenticado).

### AutenticaciÃ³n

- Login â†’ API emite JWT â†’ Front guarda sesiÃ³n (cookie HttpOnly o memoria segura) â†’ rutas privadas habilitadas.

### Checkout y pago simulado

- Carrito â†’ confirma â†’ API valida stock â†’ crea `order` + `order_items` (transacciÃ³n) â†’ `payment` simulado â†’ `status=paid` â†’ decrementa stock.

### Backoffice (admin/vendedor)

- CRUD productos/categorÃ­as â†’ subida de imÃ¡genes â†’ reportes (ventas/mes, top productos, stock bajo) â†’ gestiÃ³n de tickets de cambio.


---

## Cómo probar (demo local)

Requisitos:
- Node.js 18+
- PostgreSQL local (credenciales por defecto en ackend/.env.example)

1) Backend (API)
- Abrir terminal en ackend/
- Ejecutar: 
pm run demo
  - Copia .env.example a .env si no existe
  - Instala dependencias si faltan
  - Ejecuta prisma migrate dev
  - Inserta datos de prueba (usuario y productos)
  - Inicia el servidor con 	s-node-dev
- Comprobación rápida:
  - Salud: http://localhost:3000/health → { ok: true }
  - Productos: http://localhost:3000/api/products → lista en JSON

2) Frontend (Vite)
- Abrir otra terminal en rontend/
- 
pm i
- 
pm run dev → abre http://localhost:5173

3) Flujos
- Catálogo público (home): http://localhost:5173/
- Login: http://localhost:5173/login
  - Credenciales demo: cliente@demo.com / secret12
  - Tras iniciar sesión, el header mostrará “Cerrar sesión”
- Área privada: http://localhost:5173/admin (requiere sesión)

Notas:
- CORS está habilitado para http://localhost:5173 en desarrollo.
- Si el carrusel no muestra imágenes, agrega opcionalmente banners en rontend/public/banners/.

