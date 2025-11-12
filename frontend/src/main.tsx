import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { router } from './router'
import { ToastProvider } from './lib/toast'
import { useSession } from './hooks/useSessions.ts' // 🟢 1. Importamos el hook

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

// -----------------------------------------------------------------
// 🟢 2. Creamos el componente "Wrapper"
// -----------------------------------------------------------------
function AppBoot() {
  const { isLoading } = useSession();

  if (isLoading) {
    // Este es tu "Splash Screen" global.
    // Puedes reemplazarlo por un componente <Spinner />
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '1.2rem',
      }}>
        Cargando aplicación...
      </div>
    );
  }

  // Cuando isLoading es false, renderiza el router
  return <RouterProvider router={router} />;
}
// -----------------------------------------------------------------


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {/* 🟢 3. Reemplazamos <RouterProvider> con <AppBoot /> */}
        <AppBoot />
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>
)