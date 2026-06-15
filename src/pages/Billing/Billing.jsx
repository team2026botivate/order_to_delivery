import { useState, useMemo, useEffect } from 'react'
import { Home, Receipt, X, FileText, Send, AlertTriangle } from 'lucide-react'
import { useOrderContext } from '../../context/OrderContext'
import { COMPANIES_LIST, PRODUCTS_LIST, GODOWNS_LIST } from '../../data/dummyOrders'
import StatusTabs from '../../components/StatusTabs/StatusTabs'
import SearchFilterBar from '../../components/SearchFilterBar/SearchFilterBar'
import DataTable from '../../components/DataTable/DataTable'
import './Billing.css'

const COLUMNS = [
  { key: 'OrderNo',     label: 'Order No',     sortable: true },
  { key: 'SOrderNo',    label: 'S.Order No',   sortable: true },
  { key: 'ProductName', label: 'Product Name', sortable: true },
  { key: 'Qty',         label: 'Qty',          sortable: true, type: 'number' },
  { key: 'BillQty',     label: 'Bill Qty',     sortable: true, type: 'number' },
  { key: 'totalAmount', label: 'Total Amount', sortable: false, getter: o => o.billingData?.totalAmount || '—' },
  { key: 'billAmount',  label: 'Bill Amount',  sortable: false, getter: o => o.billingData?.billAmount || '—' },
  { key: 'BillPkgs',    label: 'Packages',     sortable: true, type: 'number' },
  { key: 'BillNo',      label: 'Bill No',      sortable: true },
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

/* ── Billing Action Modal (with partial qty logic) ─────────── */
function BillingActionModal({ order, onSubmit, onClose }) {
  const maxQty = order.Qty || 0
  const [form, setForm] = useState({
    whatsapp: '', billUrl: '', totalAmount: '', billAmount: '',
    packages: '', billQty: String(maxQty), billNo: order.BillNo !== '—' ? order.BillNo : '',
    remarks: '',
  })
  const [billImage, setBillImage] = useState(null)
  const [billImagePreview, setBillImagePreview] = useState('')
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

  const billQtyNum = parseInt(form.billQty, 10) || 0
  const remainingQty = maxQty - billQtyNum
  const isValidQty = billQtyNum > 0 && billQtyNum <= maxQty

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (!file) return
    setBillImage(file)
    const reader = new FileReader()
    reader.onload = ev => setBillImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const e = {}
    if (!form.billQty || billQtyNum <= 0) e.billQty = 'Bill Qty must be greater than 0'
    if (billQtyNum > maxQty) e.billQty = `Bill Qty cannot exceed ${maxQty}`
    if (!form.totalAmount) e.totalAmount = 'Total Amount is required'
    if (!form.billAmount) e.billAmount = 'Bill Amount is required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSubmit({
      ...form,
      billQty: billQtyNum,
      packages: parseInt(form.packages, 10) || Math.ceil(billQtyNum / 10),
      billImageUrl: billImagePreview || '',
      billImageName: billImage?.name || '',
    })
  }

  return (
    <div className="form-modal-backdrop" onClick={onClose}>
      <div className="form-modal form-modal-lg" onClick={ev => ev.stopPropagation()}>
        <div className="form-modal-header">
          <div className="form-modal-title">
            <Receipt size={17} /> Billing — {order.OrderNo}
          </div>
          <button className="form-modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="form-modal-body">
          <div className="form-section-title">Order Information (Read-only)</div>
          <div className="info-grid">
            {[
              ['Order No',   order.OrderNo], ['S.Order No', order.SOrderNo],
              ['Product',    order.ProductName], ['Available Qty', maxQty],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="info-item-label">{l}</div>
                <div className="info-item-value">{v || '—'}</div>
              </div>
            ))}
          </div>

          <div className="form-section-title">Billing Details</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Bill Qty <span className="form-required">*</span></label>
              <input
                type="number" min="1" max={maxQty}
                className="form-input"
                value={form.billQty}
                onChange={e => set('billQty', e.target.value)}
              />
              {errors.billQty
                ? <span className="form-error">{errors.billQty}</span>
                : <span className="form-hint">Max: {maxQty}</span>
              }
            </div>

            <div className="form-group">
              <label className="form-label">Qty Preview</label>
              <div style={{ paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className={`qty-badge ${remainingQty === 0 ? 'zero' : remainingQty < 0 ? 'over' : 'remaining'}`}>
                  {remainingQty < 0
                    ? <><AlertTriangle size={12} /> Over by {Math.abs(remainingQty)}</>
                    : remainingQty === 0
                      ? '✓ Full qty processed'
                      : `${remainingQty} units remain in Billing`
                  }
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Total Amount <span className="form-required">*</span></label>
              <input type="number" className="form-input" placeholder="0.00" value={form.totalAmount}
                onChange={e => set('totalAmount', e.target.value)} />
              {errors.totalAmount && <span className="form-error">{errors.totalAmount}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Bill Amount <span className="form-required">*</span></label>
              <input type="number" className="form-input" placeholder="0.00" value={form.billAmount}
                onChange={e => set('billAmount', e.target.value)} />
              {errors.billAmount && <span className="form-error">{errors.billAmount}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Packages</label>
              <input type="number" className="form-input" placeholder="Auto-calculated" value={form.packages}
                onChange={e => set('packages', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Bill No</label>
              <input type="text" className="form-input" placeholder="e.g. BILL-0001" value={form.billNo}
                onChange={e => set('billNo', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp Number</label>
              <input type="tel" className="form-input" placeholder="+91 98765 43210" value={form.whatsapp}
                onChange={e => set('whatsapp', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Bill URL</label>
              <input type="url" className="form-input" placeholder="https://..." value={form.billUrl}
                onChange={e => set('billUrl', e.target.value)} />
            </div>

            <div className="form-group form-col-span-2">
              <label className="form-label">Bill Image Upload</label>
              <input type="file" accept="image/*" className="form-input" style={{ padding: '6px 10px' }}
                onChange={handleImageChange} />
              {billImagePreview && (
                <img src={billImagePreview} alt="bill preview"
                  style={{ marginTop: 8, height: 80, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)' }} />
              )}
            </div>

            <div className="form-group form-col-span-2">
              <label className="form-label">Remarks</label>
              <textarea className="form-textarea form-input" placeholder="Add billing remarks..." value={form.remarks}
                onChange={e => set('remarks', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-success btn-sm" onClick={handleSubmit} disabled={!isValidQty}>
            <Send size={13} /> Submit Billing
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
      <div className="form-modal form-modal-lg" onClick={ev => ev.stopPropagation()}>
        <div className="form-modal-header">
          <div className="form-modal-title"><FileText size={16} /> {order.OrderNo} — Billing Details</div>
          <button className="form-modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="form-modal-body">
          <div className="info-grid">
            {[
              ['Order No', order.OrderNo], ['S.Order No', order.SOrderNo],
              ['Product', order.ProductName], ['Qty', order.Qty], 
              ['Bill Qty', order.BillQty], ['Bill No', order.BillNo], 
              ['Bill Pkgs', order.BillPkgs], ['Status', order.status?.replace(/_/g, ' ')],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="info-item-label">{l}</div>
                <div className="info-item-value">{v === 0 ? '0' : (v || '—')}</div>
              </div>
            ))}
          </div>

          {order.billingData && (
            <>
              <div className="form-section-title">Billing Submission</div>
              <div className="info-grid">
                {[
                  ['Total Amount', order.billingData.totalAmount],
                  ['Bill Amount', order.billingData.billAmount],
                  ['Packages', order.billingData.packages],
                  ['WhatsApp', order.billingData.whatsapp],
                  ['Bill URL', order.billingData.billUrl],
                  ['Remarks', order.billingData.remarks],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div className="info-item-label">{l}</div>
                    <div className="info-item-value">{v || '—'}</div>
                  </div>
                ))}
              </div>
              {order.billingData.billImageUrl && (
                <div style={{ marginTop: 12 }}>
                  <div className="info-item-label" style={{ marginBottom: 6 }}>Bill Image</div>
                  <img src={order.billingData.billImageUrl} alt="bill"
                    style={{ maxHeight: 120, borderRadius: 6, border: '1px solid var(--border)' }} />
                </div>
              )}
            </>
          )}

          {order.workflowHistory?.length > 0 && (
            <>
              <div className="form-section-title">Workflow History</div>
              {order.workflowHistory.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      {h.label}
                      {h.processedQty != null && <span style={{ color: 'var(--primary)', marginLeft: 6 }}>({h.processedQty} units processed)</span>}
                      {h.remainingQty != null && h.remainingQty > 0 && <span style={{ color: 'var(--warning-dark)', marginLeft: 6 }}>({h.remainingQty} remaining)</span>}
                    </div>
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
        o.ProductName.toLowerCase().includes(s) ||
        (o.BillNo && o.BillNo.toLowerCase().includes(s))
      )
    }
    return true
  })
}

/* ── Page ─────────────────────────────────────────────────── */
export default function Billing() {
  const { getPendingByStage, getHistoryByStage, submitBilling } = useOrderContext()
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

  const pendingRaw = getPendingByStage('BILLING_PENDING')
  const historyRaw = getHistoryByStage('BILLING_PENDING')
  const filters = { search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo }

  const pending = useMemo(() => filterOrders(pendingRaw, filters), [pendingRaw, search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo])
  const history = useMemo(() => filterOrders(historyRaw, filters), [historyRaw, search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo])
  const activeData = tab === 'pending' ? pending : history

  const clearFilters = () => {
    setSearch(''); setCompany(''); setProduct(''); setGodown('')
    setDateFrom(''); setDateTo(''); setOrderNo(''); setSOrderNo('')
  }

  const handleActionSubmit = formData => {
    submitBilling(actionOrder.id, formData)
    setActionOrder(null)
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">

        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Receipt size={22} style={{ color: '#8b5cf6' }} />
          Billing
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
        emptyMessage={tab === 'pending' ? 'No billing orders pending.' : 'No history records.'}
        emptySubMessage="Try adjusting your filters."
      />

      {viewOrder   && <ViewModal   order={viewOrder}   onClose={() => setViewOrder(null)} />}
      {actionOrder && <BillingActionModal order={actionOrder} onSubmit={handleActionSubmit} onClose={() => setActionOrder(null)} />}
    </div>
  )
}
