import { useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { OrderProvider } from './context/OrderContext'
import { AuthProvider, useAuth } from './auth/AuthContext'
import Sidebar from './components/Sidebar/Sidebar'
import AppRoutes from './routes/AppRoutes'
import './App.css'

function AppContent() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  // Hide sidebar if not logged in or on specific routes
  const hideSidebar = !user || location.pathname === '/login' || location.pathname === '/unauthorized'

  return (
    <div className="app-layout">
      {!hideSidebar && <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />}
      <div className={`main-content${collapsed && !hideSidebar ? ' sidebar-collapsed' : ''}${hideSidebar ? ' no-sidebar' : ''}`}>
        <AppRoutes />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrderProvider>
          <AppContent />
        </OrderProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
