import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{
          background: 'rgba(11,15,26,0.95)',
          border: '1px solid rgba(6,182,212,0.3)',
          color: '#F1F5F9',
          backdropFilter: 'blur(20px)',
          fontFamily: 'Syne, sans-serif',
          fontSize: '13px',
        }}
      />
    </AuthProvider>
  </React.StrictMode>
)
