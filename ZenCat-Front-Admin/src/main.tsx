import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { UserProvider } from '@/context/UserContext'   // ← importamos el proveedor
import './index.css'

import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

const queryClient = new QueryClient()
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <GoogleOAuthProvider clientId={googleClientId}>
        <QueryClientProvider client={queryClient}>
          <UserProvider>                           {/* ← aquí */}
            <RouterProvider router={router} />
          </UserProvider>                          {/* ← y cerramos */}
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </StrictMode>,
  )
}
