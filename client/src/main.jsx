import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 1. Main CSS Entry
import './styles/main.css'
// import './index.css'

import './i18n'
import App from './App.jsx'
import { AuthProvider } from '@/context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
