# Demo final - Documentacion y guion

Este documento resume los recursos necesarios para la demo final: endpoints nuevos (tickets y reportes), usuarios de prueba y un guion sugerido para mostrar el flujo **compra -> ticket -> dashboard**.

---

## 1. Endpoints nuevos

### 1.1 Tickets de cambio

| Metodo | Ruta                      | Auth                       | Quien lo usa      | Descripcion breve                                                     |
|--------|---------------------------|----------------------------|-------------------|----------------------------------------------------------------------|
| POST   | `/api/tickets`           | Cliente autenticado        | Soporte al cliente | Abre un ticket dentro de los 10 dias posteriores a la compra.       |
| GET    | `/api/tickets/:ticketId` | Cliente dueno o ADMIN/SELLER | Cliente + panel   | Consulta el estado y las lineas del ticket.                          |
| GET    | `/api/tickets`           | ADMIN/SELLER               | Equipo tienda     | Lista tickets filtrando por estado, fecha o ID de orden.            |
| PATCH  | `/api/tickets/:ticketId/status` | ADMIN/SELLER        | Equipo tienda     | Cambia el estado (`pending -> approved/rejected -> closed`).        |

#### Como abrir un ticket desde la web

1. Iniciar sesion como cliente (por ejemplo `cliente@demo.com`) y entrar a **Mis pedidos** (`/account/orders`).
2. Abrir el detalle del pedido reciente y pulsar **Solicitar ticket**.
3. Completar el formulario: seleccionar los items afectados, describir el motivo y confirmar datos de contacto.
4. Enviar el formulario. La pagina muestra el codigo del ticket (`TCK-xxxx`) y la fecha limite para el cambio.

#### Como revisar tickets en el panel

1. Iniciar sesion como `ADMIN` o `SELLER`, abrir el menu **Mi cuenta** y seleccionar **Tickets** (o usar el boton **Ver tickets** junto al de productos). Esto carga `/panel/tickets`.
2. Ajustar los filtros superiores (estado, correo, ID de orden y rango de fechas) y pulsar **Aplicar filtros**.
3. Usar el boton **Ver detalle** para revisar motivo, datos de contacto y lista de productos.

#### Como cambiar el estado de un ticket

1. En el detalle del ticket, usar el selector **Estado** para elegir `approved`, `rejected` o `closed`.
2. Agregar una nota corta (visible para el cliente en su historial).
3. Guardar. El estado se actualiza en el modal y en la tabla.

---

### 1.2 Reportes

| Metodo | Ruta                          | Auth         | Proposito                                               |
|--------|-------------------------------|--------------|---------------------------------------------------------|
| GET    | `/api/reports/sales-by-month` | ADMIN/SELLER | Serie de ventas (monto total por mes).                 |
| GET    | `/api/reports/top-products`   | ADMIN/SELLER | Ranking de productos segun unidades y revenue.         |
| GET    | `/api/reports/low-stock`      | ADMIN/SELLER | Productos con stock bajo el umbral configurado (5 por defecto). |

#### Como ver los reportes desde la UI

1. Iniciar sesion como `ADMIN` o `SELLER` y abrir `http://localhost:5173/panel/dashboard`.
2. Revisar:
   - Tarjeta **Ventas por mes**: muestra los ultimos meses; al pasar el mouse se ven montos exactos.
   - Carrusel **Top productos**: ranking con unidades vendidas y venta acumulada.
   - Tabla **Stock critico**: se alimenta de `/low-stock` y permite ir directo al editor del producto.

---

## 2. Usuarios demo

| Rol       | Email                 | Contrasena   | Fuente                           | Notas                                                                 |
|-----------|-----------------------|--------------|----------------------------------|-----------------------------------------------------------------------|
| ADMIN     | `admin@tienda.com`   | `admin123`   | Crear via API o panel           | Usar para dashboard y reportes.                                      |
| SELLER    | `vendedor@tienda.com`| `password123`| Seed (`scripts/seed.js` o `src/seed.ts`) | Puede crear y editar productos y ver reportes.                       |
| CUSTOMER  | `cliente@demo.com`   | `secret12`   | Seed                             | Usar para navegar catalogo y realizar compras antes de abrir tickets.|
| CUSTOMER  | `cliente2@demo.com`  | `secret12`   | Seed                             | Cliente adicional para pruebas.                                      |
| CUSTOMER  | `cliente3@demo.com`  | `secret12`   | Seed                             | Cliente adicional para pruebas.                                      |
| CUSTOMER  | `cliente4@demo.com`  | `secret12`   | Seed                             | Cliente adicional para pruebas.                                      |

---

## 3. Guion de la demo (compra -> ticket -> dashboard)

1. **Contexto inicial (1 min)**  
   - Mostrar home (`http://localhost:5173/`), catalogo y stock de un producto.  
   - Explicar brevemente los roles `CUSTOMER`, `SELLER` y `ADMIN`.

2. **Compra como cliente (3 min)**  
   - Iniciar sesion con `cliente@demo.com / secret12` o con una cuenta nueva desde `/registro`.  
   - Agregar un producto al carrito, ir a `checkout` y finalizar la compra.  
   - Mostrar el `orderId` en la pantalla de exito.

3. **Crear ticket de cambio (2 min)**  
   - En **Mis pedidos**, abrir el pedido recien creado y pulsar **Solicitar ticket**.  
   - Completar el formulario (motivo + datos de contacto) y enviar.  
   - Mostrar el codigo del ticket y verificar que queda en estado `pending`.

4. **Dashboard y reportes (3 min)**  
   - Iniciar sesion como `admin@tienda.com` o `vendedor@tienda.com`.  
   - Entrar a `http://localhost:5173/panel/dashboard`.  
   - Resaltar que:
     - El grafico de ventas incluye la compra reciente.
     - El producto aparece en top productos si corresponde.
     - Si el stock quedo bajo el umbral, aparece en **Stock critico**.

5. **Cierre (1 min)**  
   - Recordar que el flujo completo tambien se puede probar via API (checkout -> ticket -> reportes).  
   - Comentar que los seeds permiten repetir la demo rapidamente.

---

## 4. Checklist previo a la demo

- [ ] Ejecutar `docker compose -f docker-compose.dev.yml up --build` o el stack equivalente.  
- [ ] Correr `node scripts/seed.js` en `/backend` para restaurar datos y usuarios demo.  
- [ ] Verificar que existe el usuario admin (`admin@tienda.com`) y, si no, crearlo via panel o API.  
- [ ] Validar en el frontend que todas las credenciales pueden iniciar sesion.  
- [ ] Hacer una compra de prueba, abrir un ticket y revisar el dashboard antes de la demo.  
- [ ] Preparar pestañas pre-cargadas (catalogo, checkout, ticket, dashboard) para reducir tiempos de espera.

