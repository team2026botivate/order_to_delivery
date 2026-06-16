import { useState, useMemo, useEffect } from 'react'
import { FileText, X, CheckSquare, CheckCircle2, CheckCircle, XCircle, ClipboardCheck } from 'lucide-react'
import { useOrderContext } from '../../context/OrderContext'
import { COMPANIES_LIST, PRODUCTS_LIST, GODOWNS_LIST } from '../../data/dummyOrders'
import StatusTabs from '../../components/StatusTabs/StatusTabs'
import SearchFilterBar from '../../components/SearchFilterBar/SearchFilterBar'
import DataTable from '../../components/DataTable/DataTable'
import './Audit.css'

const COLUMNS = [
  { key: 'SOrderNo',    label: 'S.Order No',     sortable: true },
  { key: 'ProductName', label: 'Product Name',   sortable: true },
  { key: 'Qty',         label: 'Qty',            sortable: true, type: 'number' },
  { key: 'GatePassDate',label: 'Gate Pass Date', sortable: true, type: 'date' },
  { key: 'OrderNo',     label: 'Order No',       sortable: true },
  { key: 'CreatedOn',   label: 'Created On',     sortable: true, type: 'date' },
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

/* ── Audit Confirm Modal (Yes / No) ───────────────────────── */
function AuditConfirmModal({ order, onConfirm, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="form-modal-backdrop" onClick={onClose}>
      <div className="audit-confirm-modal" onClick={ev => ev.stopPropagation()}>

        {/* Header */}
        <div className="audit-confirm-header">
          <div className="audit-confirm-icon">
            <ClipboardCheck size={28} />
          </div>
          <button className="form-modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Body */}
        <div className="audit-confirm-body">
          <h2 className="audit-confirm-title">Audit Approval</h2>
          <p className="audit-confirm-sub">Do you want to approve this order for the next stage?</p>

          <div className="audit-confirm-order-info">
            <div className="audit-info-row">
              <span className="audit-info-label">Order No</span>
              <span className="audit-info-value">{order.OrderNo}</span>
            </div>
            <div className="audit-info-row">
              <span className="audit-info-label">S.Order No</span>
              <span className="audit-info-value">{order.SOrderNo}</span>
            </div>
            <div className="audit-info-row">
              <span className="audit-info-label">Product</span>
              <span className="audit-info-value">{order.ProductName}</span>
            </div>
            <div className="audit-info-row">
              <span className="audit-info-label">Company</span>
              <span className="audit-info-value">{order.CompanyName}</span>
            </div>
            <div className="audit-info-row">
              <span className="audit-info-label">Qty</span>
              <span className="audit-info-value">{order.Qty}</span>
            </div>
            <div className="audit-info-row">
              <span className="audit-info-label">Gate Pass Date</span>
              <span className="audit-info-value">{fmtDate(order.GatePassDate)}</span>
            </div>
          </div>
        </div>

        {/* Footer Yes / No */}
        <div className="audit-confirm-footer">
          <button
            className="audit-btn audit-btn-no"
            onClick={() => { onConfirm(false); onClose() }}
          >
            <XCircle size={16} /> No
          </button>
          <button
            className="audit-btn audit-btn-yes"
            onClick={() => { onConfirm(true); onClose() }}
          >
            <CheckCircle size={16} /> Yes
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
          <div className="form-modal-title"><FileText size={16} /> {order.OrderNo} — Audit Details</div>
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
              ['Status', order.status?.replace(/_/g, ' ')],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="info-item-label">{l}</div>
                <div className="info-item-value">{v === 0 ? '0' : (v || '—')}</div>
              </div>
            ))}
          </div>

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
export default function Audit() {
  const { getPendingByStage, getHistoryByStage, approveAudit } = useOrderContext()
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
  const [auditOrder, setAuditOrder] = useState(null)

  const pendingRaw = getPendingByStage('AUDIT_PENDING')
  const historyRaw = getHistoryByStage('AUDIT_PENDING')
  const filters = { search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo }

  const pending = useMemo(() => filterOrders(pendingRaw, filters), [pendingRaw, search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo])
  const history = useMemo(() => filterOrders(historyRaw, filters), [historyRaw, search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo])
  const activeData = tab === 'pending' ? pending : history

  const clearFilters = () => {
    setSearch(''); setCompany(''); setProduct(''); setGodown('')
    setDateFrom(''); setDateTo(''); setOrderNo(''); setSOrderNo('')
  }

  const handleAuditConfirm = (passed) => {
    if (auditOrder) approveAudit(auditOrder.id, passed)
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckSquare size={22} style={{ color: '#0ea5e9' }} />
          Audit
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
          All orders have been audited.
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
        showApprove={tab === 'pending'}
        instantApprove={true}
        onApprove={tab === 'pending' ? (row) => setAuditOrder(row) : null}
        emptyMessage={tab === 'pending' ? 'No orders pending audit.' : 'No audited orders yet.'}
        emptySubMessage="Orders appear here once Gate Pass is submitted."
      />

      {viewOrder && <ViewModal order={viewOrder} onClose={() => setViewOrder(null)} />}

      {auditOrder && (
        <AuditConfirmModal
          order={auditOrder}
          onConfirm={handleAuditConfirm}
          onClose={() => setAuditOrder(null)}
        />
      )}
    </div>
  )
}
