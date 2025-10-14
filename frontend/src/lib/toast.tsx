import React, { createContext, useContext, useState } from 'react';

type Toast = { id: number; kind: 'success' | 'error'; text: string };

const ToastContext = createContext<{
  push: (kind: Toast['kind'], text: string) => void;
}>({ push: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  function push(kind: Toast['kind'], text: string) {
    const id = Date.now();
    setToasts((s) => [...s, { id, kind, text }]);
    setTimeout(() => setToasts((s) => s.filter((t) => t.id !== id)), 3500);
  }
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 top-4 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-lg p-3 text-white shadow ${t.kind === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
