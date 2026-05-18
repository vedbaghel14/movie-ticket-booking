import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import { Toaster } from 'react-hot-toast'
createRoot(document.getElementById('root')).render(
  <ClerkProvider>
    <BrowserRouter>
      <App />
     <Toaster
 
  toastOptions={{
    duration: 3000,
    style: {
      background: '#111827',
      color: '#fff',
      border: '1px solid #e11d48',
    },
  }}
/>
    </BrowserRouter>
  </ClerkProvider>
)
