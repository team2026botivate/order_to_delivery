import { Activity, BarChart3, Home } from 'lucide-react'
import { useOrderContext } from '../../context/OrderContext'
import DashboardCards from '../../components/DashboardCards/DashboardCards'
import './Dashboard.css'

const DOT_CLASS = {
  ORDER_DETAILS_PENDING: 'od',
  READY_FOR_DELIVERY_PENDING: 'rfd',
  BILLING_PENDING: 'bill',
  GATE_PASS_PENDING: 'gate',
  AUDIT_PENDING: 'audit',
  FEEDBACK_PENDING: 'feedback',
  COMPLETED: 'done',
}

const CHART_DATA = [
  { key: 'orderDetailsPending',     label: 'Order Details',     colorClass: 'c1' },
  { key: 'readyForDeliveryPending', label: 'Ready For Delivery',colorClass: 'c2' },
  { key: 'billingPending',          label: 'Billing',           colorClass: 'c3' },
  { key: 'gatePassPending',         label: 'Gate Pass Out',     colorClass: 'c4' },
  { key: 'auditPending',            label: 'Audit',             colorClass: 'c5' },
  { key: 'feedbackPending',         label: 'Feedback',          colorClass: 'c6' },
  { key: 'completed',               label: 'Completed',         colorClass: 'c7' },
]

function formatTimeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export default function Dashboard() {
  const { stats, recentActivity } = useOrderContext()
  const maxVal = Math.max(1, ...CHART_DATA.map(d => stats[d.key] || 0))

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">

        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* KPI + Pipeline */}
      <DashboardCards stats={stats} />

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* Left: Recent Activity */}
        <div className="activity-card">
          <div className="activity-header">
            <div className="activity-header-title">
              <Activity size={16} />
              Recent Activity
            </div>
            <span className="badge badge-info">{recentActivity.length} entries</span>
          </div>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <div className="activity-empty">No activity yet. Approve orders to see activity here.</div>
            ) : (
              recentActivity.map((act, i) => (
                <div key={i} className="activity-item">
                  <div className={`activity-dot ${DOT_CLASS[act.stage] || 'od'}`} />
                  <div className="activity-content">
                    <div className="activity-desc">
                      <strong>{act.orderNo}</strong> approved from <strong>{act.label}</strong>
                    </div>
                    <div className="activity-meta">
                      {act.product} &bull; {act.company} &bull; by {act.approvedBy} &bull; {formatTimeAgo(act.approvedAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Status Overview Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-header-title">
              <BarChart3 size={16} />
              Order Status Overview
            </div>
          </div>
          <div className="chart-body">
            {CHART_DATA.map(item => {
              const val = stats[item.key] || 0
              const pct = Math.round((val / maxVal) * 100)
              return (
                <div key={item.key} className="chart-bar-row">
                  <div className="chart-bar-label" title={item.label}>{item.label}</div>
                  <div className="chart-bar-track">
                    <div
                      className={`chart-bar-fill ${item.colorClass}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="chart-bar-value">{val}</div>
                </div>
              )
            })}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Total Orders</span>
                <strong style={{ color: 'var(--text)' }}>{stats.total}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                <span>Completion Rate</span>
                <strong style={{ color: 'var(--success-dark)' }}>
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                <span>In Progress</span>
                <strong style={{ color: 'var(--primary)' }}>
                  {stats.total - stats.completed}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
