import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'

import { routeTree } from './routeTree.gen'
import { AuthProvider } from './context/AuthContext'

const router = createRouter({ routeTree })
const CLIENT_ID = "983602358556-gn1a4fuqj64s1sbf7m1e4eqk4otsqvbn.apps.googleusercontent.com"
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
      <GoogleOAuthProvider clientId={CLIENT_ID}> 
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </GoogleOAuthProvider>
    </StrictMode>,
  )
}
