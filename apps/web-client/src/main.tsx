import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 1. styles
import './styles/main.css'
// import './index.css'

import './i18n'
import App from './App.tsx' // Corrected extension
import { AuthProvider } from './context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <App />
        </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
