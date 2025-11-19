# Demo final – Documentación y guion

Este documento resume los recursos necesarios para la demo final del Sprint 4: endpoints recién añadidos (tickets y reportes), credenciales de prueba y el guion sugerido para presentar el flujo **compra → ticket → dashboard**.

---

## 1. Endpoints nuevos

### 1.1 Tickets de cambio

| Método | Ruta | Auth | ¿Quién lo usa? | Descripción breve |
|--------|------|------|----------------|-------------------|
| `POST` | `/api/tickets` | Cliente autenticado (`CUSTOMER`) | Soporte al cliente | Abre un ticket dentro de los 10 días posteriores a la compra. |
| `GET` | `/api/tickets/:ticketId` | Cliente dueño del ticket o rol `ADMIN/SELLER` | Cliente + backoffice | Consulta el estado y las líneas del ticket. |
| `GET` | `/api/tickets` | `ADMIN/SELLER` | Equipo tienda | Lista tickets filtrando por estado, fecha o ID de orden. |
| `PATCH` | `/api/tickets/:ticketId/status` | `ADMIN/SELLER` | Equipo tienda | Cambia el estado (`pending → approved/rejected → closed`). |

#### Cómo abrir un ticket desde la web

1. Inicia sesión como cliente (ej. `cliente@demo.com`) y ve a **Mis pedidos** (`/account/orders`).
2. Abre el detalle del pedido reciente y pulsa **Solicitar ticket**.
3. Completa el formulario: selecciona los ítems afectados, describe el motivo y confirma los datos de contacto.
4. Envía el formulario. El sitio muestra el código del ticket (`TCK-xxxx`) y la fecha límite para el cambio.

- **Validaciones visibles en la web:** solo se habilita el botón cuando el pedido tiene menos de 10 días y se elige al menos un producto. Los mensajes de error del backend aparecen como alertas rojas junto al formulario.

#### Cómo revisar tickets en el panel

1. Inicia sesión como `ADMIN`/`SELLER`, abre el menú **Mi cuenta** y selecciona **Tickets** (o usa el botón “Ver tickets” junto al de productos). Esto carga `/panel/tickets`.
2. Ajusta los filtros superiores (estado, correo, ID de orden y rango de fechas) y pulsa **Aplicar filtros** para recargar la tabla.
3. Usa el botón **Ver detalle** de cada fila para abrir el panel lateral con motivo, datos de contacto y la lista de productos.

- **Indicadores en la UI:** la tabla muestra badges por estado y la fecha de expiración; el contador superior refleja cuántos tickets cumplen con el filtro actual.

#### Cómo cambiar el estado de un ticket

1. En el detalle del ticket, usa el selector **Estado** para elegir `approved`, `rejected` o `closed`.
2. Agrega una nota corta (se muestra al cliente en su historial).
3. Guarda. El badge del modal y de la tabla se actualiza y el pie del panel muestra la fecha/hora de la última modificación.

- **Consejo demo:** cambia el estado dos veces (por ejemplo `pending → approved → closed`) y refresca la tabla para mostrar cómo responde el listado.

---

### 1.2 Reportes

| Método | Ruta | Auth | Propósito |
|--------|------|------|-----------|
| `GET` | `/api/reports/sales-by-month` | `ADMIN/SELLER` | Serie de ventas (monto total por mes). |
| `GET` | `/api/reports/top-products` | `ADMIN/SELLER` | Ranking de productos según unidades y revenue. |
| `GET` | `/api/reports/low-stock` | `ADMIN/SELLER` | Productos cuyo stock está bajo el umbral configurado (por defecto 5). |

#### Cómo ver los reportes desde la UI

1. Inicia sesión como `ADMIN` o `SELLER` y abre `http://localhost:5173/panel/dashboard`.
2. La primera tarjeta (Ventas por mes) grafica los últimos 6 meses. Al pasar el mouse se muestran órdenes y revenue exactos.
3. El carrusel **Top productos** lista el ranking actualizado. Cada tarjeta incluye unidades vendidas y venta acumulada.
4. La tabla **Stock crítico** se alimenta de `/low-stock`; desde ahí puedes saltar directo al editor del producto mediante el botón “Actualizar stock”.

- **Validación manual:** después de realizar una compra, refresca el dashboard y verifica que el mes actual aumentó y que el producto aparece en el ranking. También conviene abrir `/panel/products` para comprobar que el stock bajó.

---

## 2. Usuarios demo

| Rol | Email | Contraseña | Fuente | Notas |
|-----|-------|------------|--------|-------|
| **ADMIN** | `admin@tienda.com` | `admin123` | Crear una vez con `POST /api/users` y luego `PUT /api/users/:id/role` → `ADMIN`. | Usa este usuario para el dashboard y gestión avanzada. Guarda su token para los reportes. |
| **SELLER** | `vendedor@tienda.com` | `password123` | Seed (`scripts/seed.js` o `src/seed.ts`). | Puede crear/editar productos y también acceder a reportes. Si necesitas conservarlo como seller durante la demo, no lo promociones a admin. |
| **CUSTOMER** | `cliente@demo.com` | `secret12` | Seed. | Utilízalo para navegar el catálogo y realizar compras antes de abrir un ticket. |

> **Recomendación demo**: si promocionas temporalmente al seller a `ADMIN`, crea un nuevo seller registrando `seller-demo@correo.com` desde el formulario público `/registro` y asignándole el rol en la página de usuarios del panel.

---

## 3. Guion de la demo (compra → ticket → dashboard)

1. **Contexto inicial (1 min)**
   - Mostrar home (`http://localhost:5173/`), catálogo y destacar el stock actual de un producto.
   - Explicar que los roles `CUSTOMER`, `SELLER` y `ADMIN` ya están listos.

2. **Compra como cliente (3 min)**
   - Iniciar sesión con `cliente@demo.com / secret12` o usar la nueva cuenta creada en `/registro`.
   - Agregar un producto al carrito, continuar a `checkout`, confirmar los datos y finalizar la compra.
   - Mostrar el `orderId` que devuelve el backend (puedes verlo en la respuesta del endpoint de checkout o en la UI de confirmación).

3. **Crear ticket de cambio (2 min)**
  - En la vista **Mis pedidos**, abrir el pedido recién creado y pulsar **Solicitar cambio**.
  - Completar el formulario en pantalla (motivo + datos de contacto) y enviar.
  - Mostrar el modal de confirmación con el código del ticket y, si quieres, refrescar el listado para ver que quedó en estado `pending`.

4. **Dashboard y reportes (3 min)**
   - Iniciar sesión como `admin@tienda.com` o `vendedor@tienda.com` (si mantiene rol `SELLER`).
   - Ingresar a `http://localhost:5173/panel/dashboard`.
   - Resaltar:
     - El gráfico de ventas ya incluye el pedido recién realizado.
     - Los top productos se actualizan con la unidad vendida.
     - Si el producto quedó bajo el umbral, aparece en “Stock crítico”.
   - Tip: abre el mismo dashboard en una ventana de incógnito, compáralo antes y después de la compra para mostrar el cambio en vivo.

5. **Cierre (1 min)**
   - Recordar que todo el flujo funciona también vía API (checkout → ticket → reportes).
   - Enfatizar que los roles y endpoints documentados permiten repetir la demo sin pasos manuales adicionales.

---

## 4. Checklist previo a la demo

- [ ] Ejecutar `docker compose -f docker-compose.dev.yml up --build` o el stack equivalente.
- [ ] Correr `node scripts/seed.js` en `/backend` para restaurar datos y usuarios demo.
- [ ] Crear/promocionar el usuario admin si aún no existe (desde la pantalla de Usuarios en el panel o, si lo prefieres, vía API).
- [ ] Validar en el frontend que cada credencial puede iniciar sesión (login de cliente, panel de seller/admin).
- [ ] Hacer una compra de ensayo, abrir un ticket y revisar el dashboard antes de la demo para asegurarte de que todo el flujo se ve con datos reales.
- [ ] Preparar capturas o pestañas pre-cargadas (catálogo, checkout, ticket, dashboard) para minimizar tiempos de espera en vivo.
