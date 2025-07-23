# AgroConecta - Documentación Lógica y Funcional

Este README profundiza en la lógica, reglas de negocio y módulos clave del proyecto AgroConecta, un marketplace agrícola colombiano.

---

## 1. Gestión de Stock y Unidades
- El stock se descuenta automáticamente con cada compra confirmada.
- Configurable por tipo de unidad (kg, bulto, docena, etc.).

## 2. Validación de Campesinos
- El registro puede requerir aprobación del admin y verificación de identidad.

## 3. Fotos e Imágenes de Productos
- Se pueden subir múltiples fotos por producto.
- Las imágenes se validan y comprimen antes de guardar.

## 4. Métodos de Pago
- Pago contra entrega y transferencia.
- Integración futura con pasarelas (PayU, Nequi, Wompi).

## 5. Notificaciones
- Agricultores reciben alertas al recibir pedidos.
- Compradores son notificados por cambios de estado.

## 6. Estados del Pedido
- Estados: pendiente, pagado, en preparación, en camino, entregado, cancelado.
- Solo roles autorizados pueden cambiar estados.

## 7. Carrito Compartido y Agrupado
- Cada agricultor recibe notificación individual aunque el pedido sea agrupado.
- Se pueden tener múltiples pedidos en curso.

## 8. Entrega y Logística
- Entrega directa, punto de encuentro o por distribuidor.
- Opción de recoger en finca o punto acordado.

## 9. Sistema de Reseñas y Reputación
- Los compradores califican productos y agricultores.
- La reputación afecta la visibilidad.

## 10. Paneles por Rol (UI/UX)
- Agricultor: gestión de productos, stock, pedidos.
- Comprador: historial, seguimiento, perfil.
- Admin: gestión total, reportes, usuarios.

---

## Lógica General del Proyecto
- **Roles:** Agricultor, Cliente, Distribuidor, Administrador.
- **Productos:** Nombre, descripción, precio, imágenes, stock, categoría.
- **Pedidos:** Carrito → Pedido → Pago → Notificación → Envío → Entrega.
- **Pagos:** Contra entrega, transferencia, pasarelas.
- **Entrega:** Directa, punto de encuentro, distribuidor.
- **Paneles:** Personalizados por rol.
- **Reseñas:** Calificación tras entrega.
- **Filtros:** Por nombre, categoría, cercanía, precio.

---

## Lógica del Carrito de Compras
- Permite agregar productos de varios agricultores.
- Agrupa productos por agricultor para gestión de pedidos.
- Valida stock antes de agregar o modificar cantidades.
- Persistencia en base de datos (usuarios) o localStorage (visitantes).
- Sincronización y validación al iniciar sesión.
- Checkout divide el carrito en pedidos por agricultor.

---

## Lógica del Pedido
- Agrupa productos por agricultor y crea pedidos separados.
- Estados: pendiente, confirmado, en preparación, en camino, entregado, cancelado.
- Notificaciones en cada cambio de estado.
- Pagos: contra entrega, transferencia, digital.
- Historial y seguimiento completo.

---

## Lógica de Stock y Disponibilidad
- Control automático de stock por producto-agricultor.
- El stock se descuenta al confirmar pedido y se libera si se cancela.
- Productos agotados se ocultan o marcan como no disponibles.
- Agricultor puede reponer stock desde su panel.

---

## Lógica de Entrega y Distribución
- Métodos: directa, punto de encuentro, distribuidor.
- El cliente elige método al comprar.
- Estado del pedido y notificaciones según método.

---

## Estados del Pedido
- Flujo: pendiente → confirmado → en preparación → listo para envío → en camino/punto → entregado/cancelado/no entregado.
- Auditoría de cambios y reglas por estado.

---

## Sistema de Reputación y Reseñas
- Calificación de 1 a 5 estrellas.
- Comentarios y fotos opcionales.
- Impacto en visibilidad y reputación.
- Manejo de disputas y reportes.

---

## Gestión de Productos
- Agricultores publican, editan y controlan productos.
- Validaciones de stock, imágenes y textos.
- Historial de ventas y calificaciones por producto.

---

## Panel de Administración
- Gestión de usuarios, productos, pedidos, pagos y reportes.
- Configuración de comisiones, zonas, estados y notificaciones.
- Dashboard con métricas clave y control total.

---

## Módulos Avanzados
- Estadísticas, reportes y gráficos.
- Tickets y soporte.
- Devoluciones y reclamos.
- Trazabilidad de productos.
- Logística colaborativa y rutas inteligentes.
- Academia campesina virtual.
- Sistema de recompensas y beneficios.

---

## Ejemplo de Modelos de Datos
```ts
interface CarritoItem {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  agricultorId: string;
  stockDisponible: number;
}

interface Pedido {
  id: string;
  clienteId: string;
  agricultorId: string;
  estado: string;
  productos: PedidoItem[];
  total: number;
  fechaPedido: Date;
  metodoPago: string;
}
```

---

## Notas Finales
Este documento resume la lógica y reglas de negocio de AgroConecta. Para detalles técnicos y ejemplos de código, consulta la documentación de cada módulo en `/src/modules/`.
