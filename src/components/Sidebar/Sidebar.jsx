import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, Truck, Receipt, LogOut,
  ChevronLeft, ChevronRight, Package, Shield, User, LogOut as LogOutIcon,
  CheckSquare, MessageSquare, Clock
} from 'lucide-react'
import { useOrderContext } from '../../context/OrderContext'
import { useAuth } from '../../auth/AuthContext'
import './Sidebar.css'

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badgeKey: null,
    permission: 'dashboard'
  },
  {
    path: '/on-time-delivery',
    label: 'On Time Delivery',
    icon: Clock,
    badgeKey: null,
    permission: 'onTimeDelivery'
  },
  {
    path: '/order-details',
    label: 'Order Details',
    icon: ClipboardList,
    badgeKey: 'orderDetailsPending',
    permission: 'orderDetails'
  },
  {
    path: '/ready-for-delivery',
    label: 'Ready For Delivery',
    icon: Truck,
    badgeKey: 'readyForDeliveryPending',
    permission: 'readyForDelivery'
  },
  {
    path: '/billing',
    label: 'Billing',
    icon: Receipt,
    badgeKey: 'billingPending',
    permission: 'billing'
  },
  {
    path: '/gate-pass-out',
    label: 'Gate Pass Out',
    icon: LogOut,
    badgeKey: 'gatePassPending',
    permission: 'gatePassOut'
  },
  {
    path: '/audit',
    label: 'Audit',
    icon: CheckSquare,
    badgeKey: 'auditPending',
    permission: 'audit'
  },
  {
    path: '/feedback',
    label: 'Feedback',
    icon: MessageSquare,
    badgeKey: 'feedbackPending',
    permission: 'feedback'
  },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { stats } = useOrderContext()
  const { user, logout } = useAuth()

  if (!user) return null;

  // Filter nav items based on user permissions or admin role
  const allowedNavItems = NAV_ITEMS.filter(item => 
    user.role === 'ADMIN' || user.permissions[item.permission]
  );

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">AM</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">Ace Mark</span>
          <span className="sidebar-logo-sub">Order Management</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>

        {allowedNavItems.map(item => {
          const Icon = item.icon
          const count = item.badgeKey ? stats[item.badgeKey] : 0

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              data-tooltip={item.label}
            >
              <span className="nav-item-icon">
                <Icon size={18} strokeWidth={2} />
              </span>
              <span className="nav-item-label">{item.label}</span>
              {count > 0 && (
                <span className="nav-badge">{count}</span>
              )}
            </NavLink>
          )
        })}

        {user.role === 'ADMIN' && (
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            data-tooltip="Settings"
          >
            <span className="nav-item-icon">
              <Shield size={18} strokeWidth={2} />
            </span>
            <span className="nav-item-label">Settings</span>
          </NavLink>
        )}

        <div className="sidebar-divider" />

        <div className="nav-section-label">System</div>
        <div className="nav-item" data-tooltip="Workflow">
          <span className="nav-item-icon">
            <Package size={18} strokeWidth={2} />
          </span>
          <span className="nav-item-label">Total Orders: {stats.total}</span>
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="sidebar-user-section">
        <div className="sidebar-user-info" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 12 }}>
          <div className="sidebar-avatar" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role}</div>
            </div>
          )}
          <button onClick={logout} className="btn-icon" title="Logout" style={{ color: 'var(--text-muted)' }}>
            <LogOutIcon size={16} />
          </button>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
        {collapsed
          ? <ChevronRight size={18} />
          : <><ChevronLeft size={18} /><span style={{ marginLeft: 8, fontSize: '0.8rem', opacity: collapsed ? 0 : 1 }}>Collapse</span></>
        }
      </button>
    </aside>
  )
}
