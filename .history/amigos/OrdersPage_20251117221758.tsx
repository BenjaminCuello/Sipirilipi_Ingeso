import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import OrderService, { type Order, type OrderStatus } from '../services/OrderServices';
import { formatCLPFromCents } from '@/lib/format'; 
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente para el Modal de detalle de la orden
const OrderDetailModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in-up">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold mb-4">Detalle de la Orden #{order.id}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        
        <ul className="divide-y divide-gray-200">
          {order.items.map(item => (
            <li key={item.productId} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
              </div>
              {/* CORRECCIÓN: Usando tu función */}
              <span className="font-medium">{formatCLPFromCents(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t text-right">
          <p className="font-semibold text-lg">Total: <span className="text-indigo-600">{formatCLPFromCents(order.total)}</span></p>
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition">
          Cerrar
        </button>
      </div>
    </div>
  );
// Archivo migrado: usar frontend/src/pages/OrdersPage.tsx