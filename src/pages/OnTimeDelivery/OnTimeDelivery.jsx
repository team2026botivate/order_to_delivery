import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Truck, Search, Download, ChevronUp, ChevronDown, Eye, X, Filter, Calendar,
  Package, CheckCircle2, TrendingUp, TrendingDown, Activity, Minus, AlertTriangle, Clock
} from 'lucide-react'
import { useOrderContext } from '../../context/OrderContext'
import { COMPANIES_LIST, PRODUCTS_LIST, GODOWNS_LIST } from '../../data/dummyOrders'
import {
  getWeekNo, getDateStr, getToday, isDispatched,
  isOnTime, isSameDay, isOverdue, getDeliveryStatus, fmtDate, pct
} from '../../utils/deliveryHelpers'
import './OnTimeDelivery.css'

const DELIVERY_STATUS_OPTIONS = ['On Time', 'Delayed', 'Pending', 'Overdue']
const INIT_FILTERS = {
  weekNo: '', startDate: '', endDate: '',
  partyName: '', productName: '',
  orderNo: '', voucherNo: '',
  godown: '', deliveryStatus: '',
  invoiceDateFrom: '', invoiceDateTo: '',
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const cls = { 'On Time': 'success', 'Delayed': 'danger', 'Pending': 'warning', 'Overdue': 'danger' }[status] || 'info'
  return <span className={`otd-badge otd-badge-${cls}`}>{status}</span>
}

// ── Order Detail Modal ────────────────────────────────────────
function OrderModal({ order, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  const ds = getDeliveryStatus(order)
  return (
    <div className="form-modal-backdrop" onClick={onClose}>
      <div className="form-modal form-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="form-modal-header">
          <div className="form-modal-title"><Truck size={16} /> {order.OrderNo} — Order Details</div>
          <button className="form-modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="form-modal-body">
          <div className="info-grid">
            {[
              ['Order No', order.OrderNo], ['Voucher No', order.SOrderNo],
              ['Party', order.CompanyName], ['Product', order.ProductName],
              ['Qty', order.Qty], ['Pending Qty', order.PendingQty],
              ['Godown', order.Godown],
              ['Order Date', fmtDate(order.CreatedOn)], ['Planned Dispatch', fmtDate(order.DespDate)],
              ['RFD Date', fmtDate(order.ReadyForDeliveryDate)], ['Actual Dispatch', fmtDate(order.GatePassDate)],
              ['Invoice Date', fmtDate(order.BillingDate)], ['Dispatch Via', order.DespatchThrough || '—'],
              ['On Time', isDispatched(order) ? (isOnTime(order) ? 'Yes' : 'No') : '—'],
              ['Same Day', isDispatched(order) ? (isSameDay(order) ? 'Yes' : 'No') : '—'],
              ['Delivery Status', ds], ['Status', order.status?.replace(/_/g, ' ')],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="info-item-label">{l}</div>
                <div className="info-item-value">{v === 0 ? '0' : (v || '—')}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="form-modal-footer">
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ── Filter Bar ────────────────────────────────────────────────
function FilterBar({ filters, setFilter, weekOptions, onClear }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="otd-filterbar">
      <div className="otd-filterbar-top">
        <div className="otd-filterbar-title"><Filter size={14} /> Filters</div>
        <div className="otd-filterbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen(o => !o)}>
            {open ? 'Hide' : 'Show Filters'}
          </button>
          <button className="btn btn-outline btn-sm" onClick={onClear}>Clear All</button>
        </div>
      </div>
      {open && (
        <div className="otd-filter-grid">
          <div className="form-group">
            <label className="form-label">Week No</label>
            <select className="form-select form-input" value={filters.weekNo} onChange={e => setFilter('weekNo', e.target.value)}>
              <option value="">All Weeks</option>
              {weekOptions.map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Start Order Date</label>
            <input type="date" className="form-input" value={filters.startDate} onChange={e => setFilter('startDate', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">End Order Date</label>
            <input type="date" className="form-input" value={filters.endDate} onChange={e => setFilter('endDate', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Party Name</label>
            <select className="form-select form-input" value={filters.partyName} onChange={e => setFilter('partyName', e.target.value)}>
              <option value="">All Parties</option>
              {COMPANIES_LIST.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <select className="form-select form-input" value={filters.productName} onChange={e => setFilter('productName', e.target.value)}>
              <option value="">All Products</option>
              {PRODUCTS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Order No</label>
            <input className="form-input" placeholder="Search..." value={filters.orderNo} onChange={e => setFilter('orderNo', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Voucher No</label>
            <input className="form-input" placeholder="Search..." value={filters.voucherNo} onChange={e => setFilter('voucherNo', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Godown</label>
            <select className="form-select form-input" value={filters.godown} onChange={e => setFilter('godown', e.target.value)}>
              <option value="">All Godowns</option>
              {GODOWNS_LIST.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Delivery Status</label>
            <select className="form-select form-input" value={filters.deliveryStatus} onChange={e => setFilter('deliveryStatus', e.target.value)}>
              <option value="">All</option>
              {DELIVERY_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Invoice Date From</label>
            <input type="date" className="form-input" value={filters.invoiceDateFrom} onChange={e => setFilter('invoiceDateFrom', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Invoice Date To</label>
            <input type="date" className="form-input" value={filters.invoiceDateTo} onChange={e => setFilter('invoiceDateTo', e.target.value)} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sortable Table Head ───────────────────────────────────────
function SortTh({ label, sortKey, active, dir, onSort }) {
  return (
    <th className="otd-th-sort" onClick={() => onSort(sortKey)}>
      {label}
      {active ? (dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : null}
    </th>
  )
}

// ── Full Data Table ───────────────────────────────────────────
const PAGE_SIZE = 15
function FullDataTable({ orders }) {
  const [q, setQ] = useState('')
  const [colFilters, setColFilters] = useState({})
  const [sk, setSk] = useState('CreatedOn')
  const [sd, setSd] = useState('desc')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)

  const sort = key => { if (sk === key) setSd(d => d === 'asc' ? 'desc' : 'asc'); else { setSk(key); setSd('asc'); setPage(1) } }
  const handleColFilter = (k, v) => { setColFilters(p => ({...p, [k]: v})); setPage(1) }

  const filtered = useMemo(() => {
    let list = [...orders]
    if (q) {
      const s = q.toLowerCase()
      list = list.filter(o => [o.OrderNo, o.CompanyName, o.ProductName, o.SOrderNo, o.Godown].some(v => v?.toLowerCase().includes(s)))
    }
    
    // Apply column-wise filters
    if (colFilters.OrderNo) list = list.filter(o => o.OrderNo?.toLowerCase().includes(colFilters.OrderNo.toLowerCase()))
    if (colFilters.CompanyName) list = list.filter(o => o.CompanyName?.toLowerCase().includes(colFilters.CompanyName.toLowerCase()))
    if (colFilters.ProductName) list = list.filter(o => o.ProductName?.toLowerCase().includes(colFilters.ProductName.toLowerCase()))
    if (colFilters.SOrderNo) list = list.filter(o => o.SOrderNo?.toLowerCase().includes(colFilters.SOrderNo.toLowerCase()))
    if (colFilters.CreatedOn) list = list.filter(o => fmtDate(o.CreatedOn).toLowerCase().includes(colFilters.CreatedOn.toLowerCase()))
    if (colFilters.DespDate) list = list.filter(o => fmtDate(o.DespDate).toLowerCase().includes(colFilters.DespDate.toLowerCase()))
    if (colFilters.GatePassDate) list = list.filter(o => (isDispatched(o) ? fmtDate(o.GatePassDate) : '—').toLowerCase().includes(colFilters.GatePassDate.toLowerCase()))
    if (colFilters.OnTime) list = list.filter(o => (isDispatched(o) ? (isOnTime(o) ? 'Yes' : 'No') : '—').toLowerCase().includes(colFilters.OnTime.toLowerCase()))
    if (colFilters.SameDay) list = list.filter(o => (isDispatched(o) ? (isSameDay(o) ? 'Yes' : 'No') : '—').toLowerCase().includes(colFilters.SameDay.toLowerCase()))
    if (colFilters.PendingQty) list = list.filter(o => String(o.PendingQty || 0).includes(colFilters.PendingQty))
    if (colFilters.Overdue) list = list.filter(o => (isOverdue(o) ? 'Yes' : 'No').toLowerCase().includes(colFilters.Overdue.toLowerCase()))
    if (colFilters.Godown) list = list.filter(o => (o.Godown || '—').toLowerCase().includes(colFilters.Godown.toLowerCase()))
    if (colFilters.BillingDate) list = list.filter(o => fmtDate(o.BillingDate).toLowerCase().includes(colFilters.BillingDate.toLowerCase()))

    list.sort((a, b) => { const av = a[sk] ?? '', bv = b[sk] ?? ''; const c = String(av).localeCompare(String(bv), undefined, { numeric: true }); return sd === 'asc' ? c : -c })
    return list
  }, [orders, q, sk, sd, colFilters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const exportCSV = () => {
    const hdrs = ['Order No','Party','Product','Voucher No','Order Date','Planned Dispatch','Actual Dispatch','On Time','Same Day','Pending Qty','Overdue','Godown','Invoice Date']
    const rows = filtered.map(o => [
      o.OrderNo, o.CompanyName, o.ProductName, o.SOrderNo,
      o.CreatedOn, o.DespDate, o.GatePassDate || '',
      isDispatched(o) ? (isOnTime(o) ? 'Yes' : 'No') : '—',
      isDispatched(o) ? (isSameDay(o) ? 'Yes' : 'No') : '—',
      o.PendingQty || 0, isOverdue(o) ? 'Yes' : 'No',
      o.Godown || '', o.BillingDate || '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    const blob = new Blob([[hdrs.join(','), ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = 'OTD_Export.csv'; a.click(); URL.revokeObjectURL(a.href)
  }

  const exportExcel = () => {
    const hdrs = ['Order No','Party','Product','Voucher No','Order Date','Planned Dispatch','Actual Dispatch','On Time','Same Day','Pending Qty','Overdue','Godown','Invoice Date']
    const rows = filtered.map(o => [
      o.OrderNo, o.CompanyName, o.ProductName, o.SOrderNo,
      o.CreatedOn, o.DespDate, o.GatePassDate || '',
      isDispatched(o) ? (isOnTime(o) ? 'Yes' : 'No') : '—',
      isDispatched(o) ? (isSameDay(o) ? 'Yes' : 'No') : '—',
      o.PendingQty || 0, isOverdue(o) ? 'Yes' : 'No',
      o.Godown || '', o.BillingDate || '',
    ].join('\t'))
    const blob = new Blob([[hdrs.join('\t'), ...rows].join('\n')], { type: 'application/vnd.ms-excel' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = 'OTD_Export.xls'; a.click(); URL.revokeObjectURL(a.href)
  }

  const paginationBtns = () => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i)
  }

  return (
    <div className="otd-card">
      <div className="otd-card-header otd-card-header-wrap">
        <span className="otd-section-title" style={{ margin: 0 }}>Full Data Table</span>
        <div className="otd-card-actions">
          <div className="otd-search"><Search size={13} /><input placeholder="Search all columns..." value={q} onChange={e => { setQ(e.target.value); setPage(1) }} /></div>
          <button className="btn btn-outline btn-sm" onClick={exportCSV}><Download size={13} /> CSV</button>
          <button className="btn btn-outline btn-sm" onClick={exportExcel}><Download size={13} /> Excel</button>
        </div>
      </div>
      <div className="otd-table-wrap">
        <table className="otd-table otd-table-full">
          <thead>
            <tr>
              <SortTh label="Order No" sortKey="OrderNo" active={sk === 'OrderNo'} dir={sd} onSort={sort} />
              <SortTh label="Party Name" sortKey="CompanyName" active={sk === 'CompanyName'} dir={sd} onSort={sort} />
              <SortTh label="Product" sortKey="ProductName" active={sk === 'ProductName'} dir={sd} onSort={sort} />
              <SortTh label="Voucher No" sortKey="SOrderNo" active={sk === 'SOrderNo'} dir={sd} onSort={sort} />
              <SortTh label="Order Date" sortKey="CreatedOn" active={sk === 'CreatedOn'} dir={sd} onSort={sort} />
              <SortTh label="Planned Dispatch" sortKey="DespDate" active={sk === 'DespDate'} dir={sd} onSort={sort} />
              <SortTh label="Actual Dispatch" sortKey="GatePassDate" active={sk === 'GatePassDate'} dir={sd} onSort={sort} />
              <th>On Time</th>
              <th>Same Day</th>
              <SortTh label="Pending Qty" sortKey="PendingQty" active={sk === 'PendingQty'} dir={sd} onSort={sort} />
              <th>Overdue</th>
              <SortTh label="Godown" sortKey="Godown" active={sk === 'Godown'} dir={sd} onSort={sort} />
              <SortTh label="Invoice Date" sortKey="BillingDate" active={sk === 'BillingDate'} dir={sd} onSort={sort} />
              <th />
            </tr>
            <tr className="otd-filter-row">
              <th><input type="text" className="form-input otd-col-filter" placeholder="Filter..." value={colFilters.OrderNo || ''} onChange={e => handleColFilter('OrderNo', e.target.value)} /></th>
              <th><input type="text" className="form-input otd-col-filter" placeholder="Filter..." value={colFilters.CompanyName || ''} onChange={e => handleColFilter('CompanyName', e.target.value)} /></th>
              <th><input type="text" className="form-input otd-col-filter" placeholder="Filter..." value={colFilters.ProductName || ''} onChange={e => handleColFilter('ProductName', e.target.value)} /></th>
              <th><input type="text" className="form-input otd-col-filter" placeholder="Filter..." value={colFilters.SOrderNo || ''} onChange={e => handleColFilter('SOrderNo', e.target.value)} /></th>
              <th><input type="text" className="form-input otd-col-filter" placeholder="Filter..." value={colFilters.CreatedOn || ''} onChange={e => handleColFilter('CreatedOn', e.target.value)} /></th>
              <th><input type="text" className="form-input otd-col-filter" placeholder="Filter..." value={colFilters.DespDate || ''} onChange={e => handleColFilter('DespDate', e.target.value)} /></th>
              <th><input type="text" className="form-input otd-col-filter" placeholder="Filter..." value={colFilters.GatePassDate || ''} onChange={e => handleColFilter('GatePassDate', e.target.value)} /></th>
              <th><input type="text" className="form-input otd-col-filter" placeholder="Filter..." value={colFilters.OnTime || ''} onChange={e => handleColFilter('OnTime', e.target.value)} /></th>
              <th><input type="text" className="form-input otd-col-filter" placeholder="Filter..." value={colFilters.SameDay || ''} onChange={e => handleColFilter('SameDay', e.target.value)} /></th>
              <th><input type="text" className="form-input otd-col-filter" placeholder="Filter..." value={colFilters.PendingQty || ''} onChange={e => handleColFilter('PendingQty', e.target.value)} /></th>
              <th><input type="text" className="form-input otd-col-filter" placeholder="Filter..." value={colFilters.Overdue || ''} onChange={e => handleColFilter('Overdue', e.target.value)} /></th>
              <th><input type="text" className="form-input otd-col-filter" placeholder="Filter..." value={colFilters.Godown || ''} onChange={e => handleColFilter('Godown', e.target.value)} /></th>
              <th><input type="text" className="form-input otd-col-filter" placeholder="Filter..." value={colFilters.BillingDate || ''} onChange={e => handleColFilter('BillingDate', e.target.value)} /></th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 && <tr><td colSpan={14} className="otd-empty">No records found</td></tr>}
            {pageData.map(o => (
              <tr key={o.id}>
                <td className="otd-mono">{o.OrderNo}</td>
                <td className="otd-trunc">{o.CompanyName}</td>
                <td className="otd-trunc">{o.ProductName}</td>
                <td className="otd-mono">{o.SOrderNo}</td>
                <td>{fmtDate(o.CreatedOn)}</td>
                <td>{fmtDate(o.DespDate)}</td>
                <td>{isDispatched(o) ? fmtDate(o.GatePassDate) : '—'}</td>
                <td>{isDispatched(o) ? <span className={`otd-badge ${isOnTime(o) ? 'otd-badge-success' : 'otd-badge-danger'}`}>{isOnTime(o) ? 'Yes' : 'No'}</span> : '—'}</td>
                <td>{isDispatched(o) ? <span className={`otd-badge ${isSameDay(o) ? 'otd-badge-success' : 'otd-badge-info'}`}>{isSameDay(o) ? 'Yes' : 'No'}</span> : '—'}</td>
                <td><span className={`otd-badge ${(o.PendingQty || 0) > 0 ? 'otd-badge-warning' : 'otd-badge-success'}`}>{o.PendingQty ?? 0}</span></td>
                <td>{isOverdue(o) ? <span className="otd-badge otd-badge-danger">Yes</span> : <span className="otd-badge otd-badge-success">No</span>}</td>
                <td>{o.Godown || '—'}</td>
                <td>{fmtDate(o.BillingDate)}</td>
                <td><button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(o)}><Eye size={13} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="otd-pagination">
        <span className="otd-pag-info">{filtered.length} records · Page {page} of {totalPages}</span>
        <div className="otd-pag-btns">
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(1)}>«</button>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {paginationBtns().map(p => (
            <button key={p} className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
        </div>
      </div>
      {modal && <OrderModal order={modal} onClose={() => setModal(null)} />}
    </div>
  )
}

// ── Summary KPI Card ──────────────────────────────────────────
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

function SummaryCards({ orders }) {
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
      onTimePct: pct(onTime.length, dispatched.length),
      delayPct: pct(delayed.length, dispatched.length),
      sameDayPct: pct(sameDay.length, dispatched.length),
      otherDayPct: pct(dispatched.length - sameDay.length, dispatched.length),
      deliveryDonePct: pct(dispatched.length, orders.length),
      overdue: overdue.length,
      pendingTillToday: pendingTillToday.length,
      pendingQty: pending.reduce((s, o) => s + (o.PendingQty || 0), 0),
    }
  }, [orders])

  return (
    <div className="otd-kpi-grid" style={{ marginBottom: '20px' }}>
      <KpiCard label="Total Dispatch Planned" value={k.total} colorClass="kpi-blue" icon={Package} tooltip="Total orders matching current filters." />
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
  )
}

// ── Main Dashboard ────────────────────────────────────────────
export default function OnTimeDelivery() {
  const { orders } = useOrderContext()
  const [filters, setFilters] = useState(INIT_FILTERS)
  const setFilter = useCallback((k, v) => setFilters(f => ({ ...f, [k]: v })), [])

  const weekOptions = useMemo(() => {
    const s = new Set(orders.map(o => getWeekNo(o.CreatedOn)).filter(Boolean))
    return [...s].sort((a, b) => a - b)
  }, [orders])

  const filtered = useMemo(() => orders.filter(o => {
    if (filters.weekNo && getWeekNo(o.CreatedOn) !== Number(filters.weekNo)) return false
    if (filters.startDate && o.CreatedOn < filters.startDate) return false
    if (filters.endDate && o.CreatedOn > filters.endDate) return false
    if (filters.partyName && o.CompanyName !== filters.partyName) return false
    if (filters.productName && o.ProductName !== filters.productName) return false
    if (filters.orderNo && !o.OrderNo?.toLowerCase().includes(filters.orderNo.toLowerCase())) return false
    if (filters.voucherNo && !o.SOrderNo?.toLowerCase().includes(filters.voucherNo.toLowerCase())) return false
    if (filters.godown && o.Godown !== filters.godown) return false
    if (filters.deliveryStatus && getDeliveryStatus(o) !== filters.deliveryStatus) return false
    if (filters.invoiceDateFrom && o.BillingDate && o.BillingDate < filters.invoiceDateFrom) return false
    if (filters.invoiceDateTo && o.BillingDate && o.BillingDate > filters.invoiceDateTo) return false
    return true
  }), [orders, filters])

  return (
    <div className="page-wrapper otd-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Truck size={22} style={{ color: '#0ea5e9' }} />
          On Time Delivery Data
        </h1>
        <div className="otd-header-right">
          <span className="otd-count-badge">{filtered.length} orders</span>
          <span className="otd-date-badge"><Calendar size={12} />{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Filters */}
      <FilterBar filters={filters} setFilter={setFilter} weekOptions={weekOptions} onClear={() => setFilters(INIT_FILTERS)} />

      {/* KPI Summary Cards — updates with filters */}
      <SummaryCards orders={filtered} />

      {/* Full Data Table */}
      <FullDataTable orders={filtered} />
    </div>
  )
}
