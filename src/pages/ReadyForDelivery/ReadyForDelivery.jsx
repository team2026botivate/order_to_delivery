import { useState, useMemo, useEffect } from 'react'
import { Home, Truck, X, FileText, Send } from 'lucide-react'
import { useOrderContext } from '../../context/OrderContext'
import { COMPANIES_LIST, PRODUCTS_LIST, GODOWNS_LIST } from '../../data/dummyOrders'
import StatusTabs from '../../components/StatusTabs/StatusTabs'
import SearchFilterBar from '../../components/SearchFilterBar/SearchFilterBar'
import DataTable from '../../components/DataTable/DataTable'
import './ReadyForDelivery.css'

const COLUMNS = [
  { key: 'OrderNo',     label: 'Order No',     sortable: true },
  { key: 'SOrderNo',    label: 'S.Order No',   sortable: true },
  { key: 'ProductName', label: 'Product Name', sortable: true },
  { key: 'Qty',         label: 'Qty',          sortable: true, type: 'number' },
  { key: 'ReadyForDeliveryDate', label: 'Delivery Date', sortable: true, type: 'date' },
  { key: 'remarks',     label: 'Remarks',      sortable: false },
  { key: 'status',      label: 'Status',       sortable: true },
]

function fmtDate(v) {
  if (!v) return '—'
  const d = new Date(v)
  return isNaN(d) ? v : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtDT(v) {
  if (!v) return '—'
  const d = new Date(v)
  if (isNaN(d)) return v
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

/* ── RFD Action Modal ─────────────────────────────────────── */
function RFDActionModal({ order, onSubmit, onClose }) {
  const [deliveryDate, setDeliveryDate] = useState(order.ReadyForDeliveryDate || '')
  const [remarks, setRemarks] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const validate = () => {
    const e = {}
    if (!deliveryDate) e.deliveryDate = 'Delivery Date is required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSubmit({ deliveryDate, remarks })
  }

  return (
    <div className="form-modal-backdrop" onClick={onClose}>
      <div className="form-modal" onClick={ev => ev.stopPropagation()}>
        <div className="form-modal-header">
          <div className="form-modal-title">
            <Truck size={17} /> Ready For Delivery — {order.OrderNo}
          </div>
          <button className="form-modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="form-modal-body">
          <div className="form-section-title">Order Information (Read-only)</div>
          <div className="info-grid">
            {[
              ['Order No',    order.OrderNo],
              ['S.Order No',  order.SOrderNo],
              ['Product',     order.ProductName],
              ['Company',     order.CompanyName],
              ['Created On',  fmtDate(order.CreatedOn)],
              ['Quantity',    order.Qty],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="info-item-label">{l}</div>
                <div className="info-item-value">{v || '—'}</div>
              </div>
            ))}
          </div>

          <div className="form-section-title">Delivery Details</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Delivery Date <span className="form-required">*</span></label>
              <input
                type="date"
                className="form-input"
                value={deliveryDate}
                onChange={e => { setDeliveryDate(e.target.value); setErrors(p => ({ ...p, deliveryDate: '' })) }}
              />
              {errors.deliveryDate && <span className="form-error">{errors.deliveryDate}</span>}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">Remarks</label>
            <textarea
              className="form-textarea form-input"
              placeholder="Add any delivery remarks..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />
          </div>
        </div>

        <div className="form-modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-success btn-sm" onClick={handleSubmit}>
            <Send size={13} /> Submit &amp; Move to Billing
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── View Modal ───────────────────────────────────────────── */
function ViewModal({ order, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="form-modal-backdrop" onClick={onClose}>
      <div className="form-modal" onClick={ev => ev.stopPropagation()}>
        <div className="form-modal-header">
          <div className="form-modal-title"><FileText size={16} /> {order.OrderNo}</div>
          <button className="form-modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="form-modal-body">
          <div className="info-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {[
              ['Order No', order.OrderNo], ['S.Order No', order.SOrderNo],
              ['Product', order.ProductName], ['Qty', order.Qty],
              ['Created On', fmtDate(order.CreatedOn)], ['Delivery Date', fmtDate(order.ReadyForDeliveryDate)],
              ['Remarks', order.rfdData?.remarks || '—'], ['Status', order.status?.replace(/_/g, ' ')],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="info-item-label">{l}</div>
                <div className="info-item-value">{v || '—'}</div>
              </div>
            ))}
          </div>

          {order.rfdData && (
            <>
              <div className="form-section-title">Delivery Submission</div>
              <div className="info-grid">
                <div><div className="info-item-label">Delivery Date</div><div className="info-item-value">{fmtDate(order.rfdData.deliveryDate)}</div></div>
                <div><div className="info-item-label">Remarks</div><div className="info-item-value">{order.rfdData.remarks || '—'}</div></div>
              </div>
            </>
          )}

          {order.workflowHistory?.length > 0 && (
            <>
              <div className="form-section-title">Workflow History</div>
              {order.workflowHistory.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Approved from {h.label}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>By {h.approvedBy} · {fmtDT(h.approvedAt)}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="form-modal-footer">
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

/* ── Filter helper ────────────────────────────────────────── */
function filterOrders(orders, { search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo }) {
  return orders.filter(o => {
    if (product && o.ProductName !== product) return false
    if (orderNo && !o.OrderNo.toLowerCase().includes(orderNo.toLowerCase())) return false
    if (sOrderNo && !o.SOrderNo.toLowerCase().includes(sOrderNo.toLowerCase())) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        o.OrderNo.toLowerCase().includes(s) ||
        o.SOrderNo.toLowerCase().includes(s) ||
        o.ProductName.toLowerCase().includes(s)
      )
    }
    return true
  })
}

/* ── Page ─────────────────────────────────────────────────── */
export default function ReadyForDelivery() {
  const { getPendingByStage, getHistoryByStage, submitRFD } = useOrderContext()
  const [tab, setTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [company, setCompany] = useState('')
  const [product, setProduct] = useState('')
  const [godown, setGodown] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [orderNo, setOrderNo] = useState('')
  const [sOrderNo, setSOrderNo] = useState('')
  const [viewOrder, setViewOrder] = useState(null)
  const [actionOrder, setActionOrder] = useState(null)

  const pendingRaw = getPendingByStage('READY_FOR_DELIVERY_PENDING')
  const historyRaw = getHistoryByStage('READY_FOR_DELIVERY_PENDING')
  const filters = { search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo }

  const pending = useMemo(() => filterOrders(pendingRaw, filters), [pendingRaw, search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo])
  const history = useMemo(() => filterOrders(historyRaw, filters), [historyRaw, search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo])
  const activeData = tab === 'pending' ? pending : history

  const clearFilters = () => {
    setSearch(''); setCompany(''); setProduct(''); setGodown('')
    setDateFrom(''); setDateTo(''); setOrderNo(''); setSOrderNo('')
  }

  const handleActionSubmit = (formData) => {
    submitRFD(actionOrder.id, formData)
    setActionOrder(null)
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">

        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Truck size={22} style={{ color: 'var(--primary)' }} />
          Ready For Delivery
        </h1>
      </div>

      <StatusTabs
        activeTab={tab} onTabChange={setTab}
        pendingCount={pendingRaw.length} historyCount={historyRaw.length}
      />

      <SearchFilterBar
        search={search} onSearch={setSearch}
        company={company} onCompany={setCompany} companies={COMPANIES_LIST}
        product={product} onProduct={setProduct} products={PRODUCTS_LIST}
        godown={godown} onGodown={setGodown} godowns={GODOWNS_LIST}
        dateFrom={dateFrom} onDateFrom={setDateFrom}
        dateTo={dateTo} onDateTo={setDateTo}
        orderNo={orderNo} onOrderNo={setOrderNo}
        sOrderNo={sOrderNo} onSOrderNo={setSOrderNo}
        totalResults={activeData.length}
        onClear={clearFilters}
      />

      <DataTable
        columns={COLUMNS}
        data={activeData}
        onView={setViewOrder}
        onAction={tab === 'pending' ? setActionOrder : null}
        actionLabel="Action"
        emptyMessage={tab === 'pending' ? 'No orders pending delivery.' : 'No history records.'}
        emptySubMessage="Try adjusting your filters."
      />

      {viewOrder   && <ViewModal   order={viewOrder}   onClose={() => setViewOrder(null)} />}
      {actionOrder && <RFDActionModal order={actionOrder} onSubmit={handleActionSubmit} onClose={() => setActionOrder(null)} />}
    </div>
  )
}
