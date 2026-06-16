import { useState, useMemo, useEffect } from 'react'
import { Home, LogOut, X, FileText, Send, CheckCircle2 } from 'lucide-react'
import { useOrderContext } from '../../context/OrderContext'
import { COMPANIES_LIST, PRODUCTS_LIST, GODOWNS_LIST } from '../../data/dummyOrders'
import StatusTabs from '../../components/StatusTabs/StatusTabs'
import SearchFilterBar from '../../components/SearchFilterBar/SearchFilterBar'
import DataTable from '../../components/DataTable/DataTable'
import './GatePassOut.css'

const COLUMNS = [
  { key: 'SOrderNo',    label: 'S.Order No',     sortable: true },
  { key: 'ProductName', label: 'Product Name',   sortable: true },
  { key: 'Qty',         label: 'Qty',            sortable: true, type: 'number' },
  { key: 'CreatedOn',   label: 'Created On',     sortable: true, type: 'date' },
  { key: 'OrderNo',     label: 'Order No',       sortable: true },
  { key: 'GatePassDate',label: 'Gate Pass Date', sortable: true, type: 'date' },
]

const DESPATCH_OPTIONS = ['Road Transport', 'Rail Freight', 'Air Cargo', 'Sea Freight', 'Courier Service']

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

/* ── Gate Pass Action Modal ───────────────────────────────── */
function GatePassActionModal({ order, onSubmit, onClose }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    gatePassDate: order.GatePassDate || today,
    dispatchThrough: order.DespatchThrough || '',
    godown: order.Godown || '',
    accountName: order.AccountName || '',
    remarks: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.gatePassDate) e.gatePassDate = 'Gate Pass Date is required'
    if (!form.dispatchThrough) e.dispatchThrough = 'Dispatch Through is required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSubmit(form)
  }

  return (
    <div className="form-modal-backdrop" onClick={onClose}>
      <div className="form-modal" onClick={ev => ev.stopPropagation()}>
        <div className="form-modal-header">
          <div className="form-modal-title">
            <LogOut size={17} /> Gate Pass Out — {order.OrderNo}
          </div>
          <button className="form-modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="form-modal-body">
          <div className="form-section-title">Order Information (Read-only)</div>
          <div className="info-grid">
            {[
              ['Order No',   order.OrderNo],
              ['S.Order No', order.SOrderNo],
              ['Product',    order.ProductName],
              ['Bill Qty',   order.BillQty || order.Qty],
              ['Company',    order.CompanyName],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="info-item-label">{l}</div>
                <div className="info-item-value">{v === 0 ? '0' : (v || '—')}</div>
              </div>
            ))}
          </div>

          <div className="form-section-title">Gate Pass Details</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gate Pass Date <span className="form-required">*</span></label>
              <input type="date" className="form-input" value={form.gatePassDate}
                onChange={e => set('gatePassDate', e.target.value)} />
              {errors.gatePassDate && <span className="form-error">{errors.gatePassDate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Dispatch Through <span className="form-required">*</span></label>
              <select className="form-select form-input" value={form.dispatchThrough}
                onChange={e => set('dispatchThrough', e.target.value)}>
                <option value="">Select...</option>
                {DESPATCH_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              {errors.dispatchThrough && <span className="form-error">{errors.dispatchThrough}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Godown</label>
              <select className="form-select form-input" value={form.godown}
                onChange={e => set('godown', e.target.value)}>
                <option value="">Select Godown</option>
                {GODOWNS_LIST.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Account Name</label>
              <input type="text" className="form-input" placeholder="Account name..." value={form.accountName}
                onChange={e => set('accountName', e.target.value)} />
            </div>

            <div className="form-group form-col-span-2">
              <label className="form-label">Remarks</label>
              <textarea className="form-textarea form-input" placeholder="Add gate pass remarks..." value={form.remarks}
                onChange={e => set('remarks', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-success btn-sm" onClick={handleSubmit}>
            <Send size={13} /> Submit &amp; Mark Completed
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
          <div className="form-modal-title"><FileText size={16} /> {order.OrderNo} — Gate Pass Details</div>
          <button className="form-modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="form-modal-body">
          <div className="info-grid">
            {[
              ['Order No', order.OrderNo], ['S.Order No', order.SOrderNo],
              ['Product', order.ProductName], ['Company', order.CompanyName],
              ['Qty', order.Qty], ['Bill Qty', order.BillQty],
              ['Gate Pass Date', fmtDate(order.GatePassDate)],
              ['Dispatch Through', order.DespatchThrough], ['Godown', order.Godown],
              ['Account Name', order.AccountName], ['Status', order.status?.replace(/_/g, ' ')],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="info-item-label">{l}</div>
                <div className="info-item-value">{v === 0 ? '0' : (v || '—')}</div>
              </div>
            ))}
          </div>

          {order.gatePassData && (
            <>
              <div className="form-section-title">Gate Pass Submission</div>
              <div className="info-grid">
                {[
                  ['Gate Pass Date', fmtDate(order.gatePassData.gatePassDate)],
                  ['Dispatch Through', order.gatePassData.dispatchThrough],
                  ['Godown', order.gatePassData.godown],
                  ['Account Name', order.gatePassData.accountName],
                  ['Remarks', order.gatePassData.remarks],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div className="info-item-label">{l}</div>
                    <div className="info-item-value">{v || '—'}</div>
                  </div>
                ))}
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
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{h.label}</div>
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
    if (company && o.CompanyID !== company) return false
    if (product && o.ProductName !== product) return false
    if (godown && o.Godown !== godown) return false
    if (dateFrom && new Date(o.CreatedOn) < new Date(dateFrom)) return false
    if (dateTo && new Date(o.CreatedOn) > new Date(dateTo)) return false
    if (orderNo && !o.OrderNo.toLowerCase().includes(orderNo.toLowerCase())) return false
    if (sOrderNo && !o.SOrderNo.toLowerCase().includes(sOrderNo.toLowerCase())) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        o.OrderNo.toLowerCase().includes(s) ||
        o.SOrderNo.toLowerCase().includes(s) ||
        o.ProductName.toLowerCase().includes(s) ||
        o.CompanyName.toLowerCase().includes(s)
      )
    }
    return true
  })
}

/* ── Page ─────────────────────────────────────────────────── */
export default function GatePassOut() {
  const { getPendingByStage, getHistoryByStage, submitGatePass } = useOrderContext()
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

  const pendingRaw = getPendingByStage('GATE_PASS_PENDING')
  const historyRaw = getHistoryByStage('GATE_PASS_PENDING')
  const filters = { search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo }

  const pending = useMemo(() => filterOrders(pendingRaw, filters), [pendingRaw, search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo])
  const history = useMemo(() => filterOrders(historyRaw, filters), [historyRaw, search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo])
  const activeData = tab === 'pending' ? pending : history

  const clearFilters = () => {
    setSearch(''); setCompany(''); setProduct(''); setGodown('')
    setDateFrom(''); setDateTo(''); setOrderNo(''); setSOrderNo('')
  }

  const handleActionSubmit = formData => {
    submitGatePass(actionOrder.id, formData)
    setActionOrder(null)
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">

        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogOut size={22} style={{ color: '#14b8a6' }} />
          Gate Pass Out
        </h1>
      </div>

      {tab === 'pending' && pendingRaw.length === 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          background: 'var(--success-light)', border: '1px solid var(--success-muted)',
          borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: '0.85rem',
          color: 'var(--success-dark)', fontWeight: 500,
        }}>
          <CheckCircle2 size={16} />
          All orders have been processed through Gate Pass Out.
        </div>
      )}

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
        emptyMessage={tab === 'pending' ? 'No orders pending gate pass.' : 'No completed orders yet.'}
        emptySubMessage="Orders appear here once approved from Billing."
      />

      {viewOrder   && <ViewModal        order={viewOrder}   onClose={() => setViewOrder(null)} />}
      {actionOrder && <GatePassActionModal order={actionOrder} onSubmit={handleActionSubmit} onClose={() => setActionOrder(null)} />}
    </div>
  )
}
