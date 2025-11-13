import { type CartItem as CartStoreItem } from '@/store/cartStore'; // Importamos el tipo del store

// --- Definición de Tipos (ya existentes de la tarea anterior) ---
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  createdAt: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
}

// --- Mock de Datos (ya existente) ---
const mockOrders: Order[] = [
    // ... (órdenes de la tarea anterior)
    { id: 1024, createdAt: '2025-11-10T14:20:10Z', total: 89990, status: 'delivered', items: [{ productId: 1, productName: 'Mouse Gamer Pro-X', quantity: 1, price: 49990 }, { productId: 2, productName: 'Teclado Mecánico K-500', quantity: 1, price: 40000 }] },
    { id: 1023, createdAt: '2025-10-25T18:00:00Z', total: 125000, status: 'shipped', items: [{ productId: 3, productName: 'Monitor Curvo 27"', quantity: 1, price: 125000 }] },
];

// --- Definición del Servicio ---
export const OrderService = {
  // --- listMine() (ya existente de la tarea anterior) ---
  async listMine(): Promise<Order[]> {
    console.log('[Mock] Obteniendo órdenes del usuario...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockOrders;
  },

  // --- ¡NUEVO MÉTODO! ---
  /**
   * Simula la creación de una nueva orden a partir de los items del carrito.
   * @param items - Los items del carrito de compras.
   * @returns Un objeto con los detalles de la orden creada.
   */
  async create(items: CartStoreItem[]): Promise<{ orderId: number; createdAt: string; total: number }> {
    console.log('[Mock] Creando una nueva orden...');

    if (!items || items.length === 0) {
      throw new Error('No se puede crear una orden con un carrito vacío.');
    }

    // 1. Simular la lógica del backend: calcular el total y transformar los items.
    const total = items.reduce((sum, item) => sum + item.price_cents * item.quantity, 0);
    const orderItems: OrderItem[] = items.map(item => ({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      price: item.price_cents,
    }));

    // 2. Crear la nueva orden
    const newOrder: Order = {
      id: Math.floor(Math.random() * 10000) + 1100, // ID aleatorio para el mock
      createdAt: new Date().toISOString(),
      total: total,
      status: 'paid', // La simulación de pago siempre es exitosa
      items: orderItems,
    };

    // 3. Simular un retardo de red
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 4. "Persistir" la orden en memoria para que aparezca en el historial
    mockOrders.unshift(newOrder);

    // 5. Retornar los datos que la UI de éxito necesita
    return {
      orderId: newOrder.id,
      createdAt: newOrder.createdAt,
      total: newOrder.total,
    };
  },
};

export default OrderService;