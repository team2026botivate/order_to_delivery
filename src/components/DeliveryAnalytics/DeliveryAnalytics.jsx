import { useMemo, useState } from 'react'
import {
  Package, Clock, CheckCircle2, TrendingUp, TrendingDown,
  Activity, Minus, AlertTriangle, ListOrdered, Receipt
} from 'lucide-react'
import {
  getWeekNo, getDateStr, getToday, isDispatched,
  isOnTime, isSameDay, isOverdue, pct
} from '../../utils/deliveryHelpers'
import '../../pages/OnTimeDelivery/OnTimeDelivery.css'

// ── SVG Doughnut ──────────────────────────────────────────────
function DonutChart({ value, total, color, label, sublabel }) {
  const p = pct(value, total)
  const r = 38, circ = 2 * Math.PI * r
  const dash = (p / 100) * circ
  return (
    <div className="otd-donut">
      <svg viewBox="0 0 100 100" className="otd-donut-svg">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--gray-100)" strokeWidth="11" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="11"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
        <text x="50" y="46" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--text)">{p}%</text>
        <text x="50" y="59" textAnchor="middle" fontSize="7.5" fill="var(--text-muted)">{value}/{total}</text>
      </svg>
      <div className="otd-donut-label">{label}</div>
      {sublabel && <div className="otd-donut-sublabel">{sublabel}</div>}
    </div>
  )
}

// ── Horizontal Bar ────────────────────────────────────────────
function HBar({ items, valueKey, labelKey, color, secondaryKey, secondaryLabel }) {
  const maxVal = Math.max(...items.map(it => it[valueKey]), 1)
  return (
    <div className="otd-hbar-list">
      {items.map((it, i) => (
        <div key={i} className="otd-hbar-row">
          <div className="otd-hbar-rank">#{i + 1}</div>
          <div className="otd-hbar-body">
            <div className="otd-hbar-meta">
              <span className="otd-hbar-name" title={it[labelKey]}>{it[labelKey]}</span>
              <div className="otd-hbar-stats">
                <span className="otd-hbar-val">{it[valueKey]}</span>
                {secondaryKey && <span className="otd-hbar-perf">{it[secondaryKey]}% {secondaryLabel}</span>}
              </div>
            </div>
            <div className="otd-hbar-track">
              <div className="otd-hbar-fill" style={{ width: `${(it[valueKey] / maxVal) * 100}%`, background: color }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Spark Line ────────────────────────────────────────────────
function SparkLine({ data, color }) {
  if (!data || data.length < 2) return <div className="otd-spark-empty">No data yet</div>
  const W = 280, H = 70, P = 6
  const max = Math.max(...data.map(d => d.v), 1)
  const xy = data.map((d, i) => ({
    x: P + (i / (data.length - 1)) * (W - P * 2),
    y: H - P - (d.v / max) * (H - P * 2),
  }))
  const pts = xy.map(p => `${p.x},${p.y}`).join(' ')
  const fill = `${P},${H} ${pts} ${W - P},${H}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="otd-spark" preserveAspectRatio="none">
      <polygon points={fill} fill={color} opacity="0.12" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {xy.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} />)}
    </svg>
  )
}

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({ label, value, suffix, colorClass, icon: Icon, tooltip }) {
  const [tip, setTip] = useState(false)
  return (
    <div className={`otd-kpi ${colorClass}`}>
      <div className="otd-kpi-head">
        <div className="otd-kpi-icon"><Icon size={17} /></div>
        <div className="otd-kpi-tip" onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
          <span>?</span>
          {tip && <div className="otd-kpi-tooltip">{tooltip}</div>}
        </div>
      </div>
      <div className="otd-kpi-value">{value}<span className="otd-kpi-suffix">{suffix}</span></div>
      <div className="otd-kpi-label">{label}</div>
    </div>
  )
}

// ── Pipeline Flow ─────────────────────────────────────────────
function PipelineFlow({ k }) {
  const stages = [
    { label: 'Orders Planned', count: k.total, pct: 100, color: '#3b7ef7' },
    { label: 'Actual Dispatch', count: k.dispatched, pct: pct(k.dispatched, k.total), color: '#22c55e' },
    { label: 'Pending Dispatch', count: k.pending, pct: pct(k.pending, k.total), color: '#f59e0b' },
    { label: 'Delivery Done', count: k.dispatched, pct: pct(k.dispatched, k.total), color: '#14b8a6' },
    { label: 'On Time', count: k.onTime, pct: pct(k.onTime, k.dispatched), color: '#22c55e' },
    { label: 'Same Day', count: k.sameDay, pct: pct(k.sameDay, k.dispatched), color: '#8b5cf6' },
  ]
  return (
    <div className="otd-card otd-pipeline" style={{ marginTop: '24px' }}>
      <div className="otd-section-title"><Activity size={15} /> Delivery Pipeline</div>
      <div className="otd-pipeline-scroll">
        {stages.map((s, i) => (
          <div key={i} className="otd-pipe-stage">
            <div className="otd-pipe-circle" style={{ borderColor: s.color, color: s.color }}>
              <span className="otd-pipe-count">{s.count}</span>
              <span className="otd-pipe-pct">{s.pct}%</span>
            </div>
            <div className="otd-pipe-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Recent Orders & Billing ───────────────────────────────────
function RecentOrdersTable({ orders }) {
  const recentOrders = [...orders].sort((a, b) => new Date(b.CreatedOn) - new Date(a.CreatedOn)).slice(0, 5)
  return (
    <div className="otd-card">
      <div className="otd-card-header">
        <span className="otd-section-title" style={{ margin: 0, display: 'flex', alignItems: 'center' }}><ListOrdered size={15} style={{ marginRight: '6px' }} /> Recent Orders</span>
      </div>
      <div className="otd-table-wrap">
        <table className="otd-table">
          <thead>
            <tr><th>Order No</th><th>Date</th><th>Party</th><th>Product</th><th>Qty</th><th>Status</th></tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 && <tr><td colSpan={6} className="otd-empty">No orders</td></tr>}
            {recentOrders.map(o => (
              <tr key={o.id}>
                <td className="otd-mono">{o.OrderNo}</td>
                <td>{new Date(o.CreatedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                <td className="otd-trunc" style={{ maxWidth: '120px' }} title={o.CompanyName}>{o.CompanyName}</td>
                <td className="otd-trunc" style={{ maxWidth: '120px' }} title={o.ProductName}>{o.ProductName}</td>
                <td>{o.Qty}</td>
                <td><span className={`otd-badge otd-badge-${o.status === 'COMPLETED' ? 'success' : 'warning'}`}>{o.status.replace(/_/g, ' ')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RecentBillingTable({ orders }) {
  const recentBilling = [...orders].filter(o => o.BillingDate).sort((a, b) => new Date(b.BillingDate) - new Date(a.BillingDate)).slice(0, 5)
  return (
    <div className="otd-card">
      <div className="otd-card-header">
        <span className="otd-section-title" style={{ margin: 0, display: 'flex', alignItems: 'center' }}><Receipt size={15} style={{ marginRight: '6px' }} /> Recent Billing</span>
      </div>
      <div className="otd-table-wrap">
        <table className="otd-table">
          <thead>
            <tr><th>Order No</th><th>Billing Date</th><th>Party</th><th>Product</th><th>Qty</th><th>Status</th></tr>
          </thead>
          <tbody>
            {recentBilling.length === 0 && <tr><td colSpan={6} className="otd-empty">No billed orders</td></tr>}
            {recentBilling.map(o => (
              <tr key={o.id}>
                <td className="otd-mono">{o.OrderNo}</td>
                <td>{new Date(o.BillingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                <td className="otd-trunc" style={{ maxWidth: '120px' }} title={o.CompanyName}>{o.CompanyName}</td>
                <td className="otd-trunc" style={{ maxWidth: '120px' }} title={o.ProductName}>{o.ProductName}</td>
                <td>{o.Qty}</td>
                <td><span className={`otd-badge otd-badge-${o.status === 'COMPLETED' ? 'success' : 'warning'}`}>{o.status.replace(/_/g, ' ')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function DeliveryAnalytics({ orders, children }) {
  // KPI metrics
  const k = useMemo(() => {
    const dispatched = orders.filter(isDispatched)
    const pending = orders.filter(o => !isDispatched(o))
    const onTime = dispatched.filter(isOnTime)
    const delayed = dispatched.filter(o => !isOnTime(o))
    const sameDay = dispatched.filter(isSameDay)
    const overdue = orders.filter(isOverdue)
    const td = getToday()
    const pendingTillToday = pending.filter(o => !o.DespDate || new Date(o.DespDate) >= td)
    return {
      total: orders.length,
      dispatched: dispatched.length,
      pending: pending.length,
      onTime: onTime.length,
      delayed: delayed.length,
      sameDay: sameDay.length,
      otherDay: dispatched.length - sameDay.length,
      overdue: overdue.length,
      pendingTillToday: pendingTillToday.length,
      pendingQty: pending.reduce((s, o) => s + (o.PendingQty || 0), 0),
      onTimePct: pct(onTime.length, dispatched.length),
      delayPct: pct(delayed.length, dispatched.length),
      sameDayPct: pct(sameDay.length, dispatched.length),
      otherDayPct: pct(dispatched.length - sameDay.length, dispatched.length),
      deliveryDonePct: pct(dispatched.length, orders.length),
    }
  }, [orders])

  // Top 10 Products
  const top10Products = useMemo(() => {
    const m = {}
    orders.forEach(o => {
      if (!m[o.ProductName]) m[o.ProductName] = { name: o.ProductName, orders: 0, qty: 0, dispatched: 0 }
      m[o.ProductName].orders++
      m[o.ProductName].qty += o.Qty || 0
      if (isDispatched(o)) m[o.ProductName].dispatched++
    })
    return Object.values(m)
      .map(p => ({ ...p, perfPct: pct(p.dispatched, p.orders) }))
      .sort((a, b) => b.qty - a.qty).slice(0, 10)
  }, [orders])

  // Top 10 Customers
  const top10Customers = useMemo(() => {
    const m = {}
    orders.forEach(o => {
      if (!m[o.CompanyName]) m[o.CompanyName] = { name: o.CompanyName, orders: 0, pendingQty: 0, dispatched: 0 }
      m[o.CompanyName].orders++
      m[o.CompanyName].pendingQty += o.PendingQty || 0
      if (isDispatched(o)) m[o.CompanyName].dispatched++
    })
    return Object.values(m)
      .map(c => ({ ...c, perfPct: pct(c.dispatched, c.orders) }))
      .sort((a, b) => b.orders - a.orders).slice(0, 10)
  }, [orders])

  // Trend data
  const dailyTrend = useMemo(() => {
    const m = {}
    orders.filter(isDispatched).forEach(o => {
      const d = getDateStr(o.GatePassDate); if (d) m[d] = (m[d] || 0) + 1
    })
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([k, v]) => ({ label: k.slice(5), v }))
  }, [orders])

  const weeklyTrend = useMemo(() => {
    const m = {}
    orders.filter(isDispatched).forEach(o => {
      const w = getWeekNo(o.GatePassDate); if (w) m[w] = (m[w] || 0) + 1
    })
    return Object.entries(m).sort(([a], [b]) => Number(a) - Number(b)).slice(-8).map(([k, v]) => ({ label: `W${k}`, v }))
  }, [orders])

  const monthlyTrend = useMemo(() => {
    const m = {}
    orders.filter(isDispatched).forEach(o => {
      const mo = getDateStr(o.GatePassDate)?.slice(0, 7); if (mo) m[mo] = (m[mo] || 0) + 1
    })
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ label: k.slice(5) + '/' + k.slice(2, 4), v }))
  }, [orders])

  return (
    <div style={{ marginTop: '24px' }}>
      <div className="otd-kpi-grid">
        <KpiCard label="Total Dispatch Planned" value={k.total} colorClass="kpi-blue" icon={Package} tooltip="Total number of orders in the system." />
        <KpiCard label="Actual Dispatch" value={k.dispatched} colorClass="kpi-green" icon={CheckCircle2} tooltip="Orders where Gate Pass has been submitted." />
        <KpiCard label="Pending Dispatch" value={k.pending} colorClass="kpi-orange" icon={Clock} tooltip="Orders not yet dispatched." />
        <KpiCard label="Delivery Done" value={k.deliveryDonePct} suffix="%" colorClass="kpi-teal" icon={TrendingUp} tooltip="Actual Dispatch ÷ Total Planned × 100" />
        <KpiCard label="On Time Delivery" value={k.onTimePct} suffix="%" colorClass="kpi-green" icon={CheckCircle2} tooltip="Dispatched on or before planned date ÷ Total Dispatched × 100" />
        <KpiCard label="Delay Delivery" value={k.delayPct} suffix="%" colorClass="kpi-red" icon={TrendingDown} tooltip="Delayed dispatches ÷ Total Dispatched × 100" />
        <KpiCard label="Same Day Delivery" value={k.sameDayPct} suffix="%" colorClass="kpi-purple" icon={Activity} tooltip="Gate Pass date = Order creation date ÷ Total Dispatched × 100" />
        <KpiCard label="Other Day Delivery" value={k.otherDayPct} suffix="%" colorClass="kpi-gray" icon={Minus} tooltip="Non-same-day dispatches ÷ Total Dispatched × 100" />
        <KpiCard label="Total Pending Qty" value={k.pendingQty} colorClass="kpi-orange" icon={AlertTriangle} tooltip="Sum of pending quantities across all non-dispatched orders." />
        <KpiCard label="Total Overdue Orders" value={k.overdue} colorClass="kpi-red" icon={AlertTriangle} tooltip="Pending orders whose planned dispatch date has passed." />
        <KpiCard label="Pending Till Today" value={k.pendingTillToday} colorClass="kpi-blue" icon={Clock} tooltip="Pending orders with planned dispatch date ≥ today." />
      </div>

      <PipelineFlow k={k} />

      <div className="otd-grid-2" style={{ marginTop: '24px' }}>
        <RecentOrdersTable orders={orders} />
        <RecentBillingTable orders={orders} />
      </div>

      <div className="otd-grid-2" style={{ marginTop: '24px' }}>
        <div className="otd-card">
          <div className="otd-card-header">
            <span className="otd-section-title" style={{ margin: 0 }}>Top 10 Products — Dispatch Volume</span>
          </div>
          <HBar items={top10Products} valueKey="qty" labelKey="name" color="var(--primary)" secondaryKey="perfPct" secondaryLabel="delivered" />
        </div>
        <div className="otd-card">
          <div className="otd-card-header">
            <span className="otd-section-title" style={{ margin: 0 }}>Top 10 Customers — Order Volume</span>
          </div>
          <HBar items={top10Customers} valueKey="orders" labelKey="name" color="#14b8a6" secondaryKey="perfPct" secondaryLabel="delivered" />
        </div>
      </div>

      <div className="otd-card" style={{ marginTop: '24px' }}>
        <div className="otd-card-header"><span className="otd-section-title" style={{ margin: 0 }}>Delivery Performance Analytics</span></div>
        <div className="otd-analytics-body">
          <div className="otd-donut-row">
            <DonutChart value={k.onTime} total={k.dispatched} color="#22c55e" label="On Time vs Delay" sublabel="On Time dispatches" />
            <DonutChart value={k.sameDay} total={k.dispatched} color="#8b5cf6" label="Same Day vs Other Day" sublabel="Same Day dispatches" />
            <DonutChart value={k.overdue} total={k.pending} color="#ef4444" label="Overdue vs Pending" sublabel="Overdue of pending" />
          </div>
          <div className="otd-trends">
            <div className="otd-trend-block">
              <div className="otd-trend-title">Daily Dispatch Trend (Last 14 Days)</div>
              <SparkLine data={dailyTrend} color="var(--primary)" />
              <div className="otd-trend-xaxis">
                {dailyTrend.filter((_, i) => i % Math.ceil(dailyTrend.length / 7) === 0).map(d => <span key={d.label}>{d.label}</span>)}
              </div>
            </div>
            <div className="otd-trend-block">
              <div className="otd-trend-title">Weekly Dispatch Trend</div>
              <SparkLine data={weeklyTrend} color="#22c55e" />
              <div className="otd-trend-xaxis">
                {weeklyTrend.map(d => <span key={d.label}>{d.label}</span>)}
              </div>
            </div>
            <div className="otd-trend-block">
              <div className="otd-trend-title">Monthly Dispatch Trend</div>
              <SparkLine data={monthlyTrend} color="#f59e0b" />
              <div className="otd-trend-xaxis">
                {monthlyTrend.map(d => <span key={d.label}>{d.label}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
