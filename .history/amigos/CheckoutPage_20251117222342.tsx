import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, selectCartItems, selectCartTotal } from '@/store/cartStore';
import OrderService from '@/services/OrderServices';
import { useMutation } from '@tanstack/react-query';
import { formatCLPFromCents } from '@/lib/format';
import { Header } from '@/components/common/Header';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const items = useCartStore(selectCartItems);
  const totalCents = useCartStore(selectCartTotal);
  const clearCart = useCartStore((state: ReturnType<typeof useCartStore.getState>) => state.clear);

  const createOrderMutation = useMutation({
    mutationFn: () => OrderService.create(items),
    onSuccess: (data) => {
      // Si la creación es exitosa, vaciamos el carrito y redirigimos
      clearCart();
      navigate(`/checkout/success?orderId=${data.orderId}`);
    },
    onError: (error: Error) => {
      // En un caso real, mostraríamos una notificación al usuario
      console.error("Error al crear la orden:", error);
      alert(`Error: ${error.message}`);
    }
  });

  const handleConfirmPurchase = () => {
    createOrderMutation.mutate();
  };

  if (items.length === 0 && !createOrderMutation.isSuccess) {
    return (
      <div className="text-center p-10">
        <h2 className="text-xl">Tu carrito está vacío.</h2>
        <button onClick={() => navigate('/')} className="mt-4 btn btn-primary">Volver al catálogo</button>
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-gray-50">
      <Header />
      <section className="max-w-2xl mx-auto p-6">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Confirmar Compra</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold border-b pb-2 mb-3">Resumen de la Orden</h2>
            <ul className="divide-y divide-gray-200">
              {items.map((item: { id: string; name: string; quantity: number; price_cents: number }) => (
                <li key={item.id} className="py-3 flex justify-between">
                  <span>{item.name} (x{item.quantity})</span>
                  <span className="font-medium">{formatCLPFromCents(item.price_cents * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total a Pagar</span>
              <span>{formatCLPFromCents(totalCents)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-6 text-center">
            Este es un pago simulado. Al confirmar, tu orden será procesada inmediatamente.
          </p>

          <button
            onClick={handleConfirmPurchase}
            disabled={createOrderMutation.isPending}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-wait"
          >
            {createOrderMutation.isPending ? 'Procesando pago...' : 'Confirmar y Pagar'}
          </button>
        </div>
      </section>
    </main>
  );
};

export default CheckoutPage;