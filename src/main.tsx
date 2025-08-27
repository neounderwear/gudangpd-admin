import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRoutes from './routes'
import { AuthProvider } from '@/context/AuthContext'
import { SnackbarProvider } from '@/shared/components/Snackbar'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SnackbarProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </SnackbarProvider>
  </React.StrictMode>,
)
