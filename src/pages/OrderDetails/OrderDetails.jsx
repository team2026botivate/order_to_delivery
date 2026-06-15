import { useState, useMemo, useEffect } from 'react'
import { Home, X, FileText, Plus, CheckCircle } from 'lucide-react'
import { useOrderContext } from '../../context/OrderContext'
import { COMPANIES_LIST, PRODUCTS_LIST, GODOWNS_LIST } from '../../data/dummyOrders'
import StatusTabs from '../../components/StatusTabs/StatusTabs'
import SearchFilterBar from '../../components/SearchFilterBar/SearchFilterBar'
import DataTable from '../../components/DataTable/DataTable'
import './OrderDetails.css'

/* ── Table columns ─────────────────────────────────────────── */
const COLUMNS = [
  { key: 'OrderNo',              label: 'Order No',       sortable: true, width: 130 },
  { key: 'SOrderNo',             label: 'S.Order No',     sortable: true, width: 110 },
  { key: 'SOrderDateTime',       label: 'S.Order Date',   sortable: true, type: 'datetime', width: 140 },
  { key: 'ReadyForDeliveryDate', label: 'RFD Date',       sortable: true, type: 'date',     width: 110 },
  { key: 'GatePassDate',         label: 'Gate Pass Date', sortable: true, type: 'date',     width: 115 },
  { key: 'BillingDate',          label: 'Billing Date',   sortable: true, type: 'date',     width: 110 },
  { key: 'CreatedOn',            label: 'Created On',     sortable: true, type: 'date',     width: 105 },
  { key: 'DespatchThrough',      label: 'Despatch',       sortable: true, width: 120 },
  { key: 'BuyresRef',            label: "Buyer's Ref",    sortable: true, width: 100 },
  { key: 'DespDate',             label: 'Desp. Date',     sortable: true, type: 'date',     width: 105 },
  { key: 'CompanyID',            label: 'Company ID',     sortable: true, width: 100 },
  { key: 'Godown',               label: 'Godown',         sortable: true, width: 130 },
  { key: 'AccountName',          label: 'Account Name',   sortable: true, width: 150 },
  { key: 'ProductName',          label: 'Product Name',   sortable: true, width: 140 },
  { key: 'Qty',                  label: 'Qty',            sortable: true, type: 'number',   width: 70  },
  { key: 'Qty_Billed',           label: 'Qty Billed',     sortable: true, type: 'number',   width: 85  },
  { key: 'PendingQty',           label: 'Pending Qty',    sortable: true, type: 'number',   width: 90  },
  { key: 'BillQty',              label: 'Bill Qty',       sortable: true, type: 'number',   width: 75  },
  { key: 'BillPkgs',             label: 'Bill Pkgs',      sortable: true, type: 'number',   width: 80  },
  { key: 'BillNo',               label: 'Bill No',        sortable: true, width: 100 },
  { key: 'ImgUrl',               label: 'Image',          type: 'image',  width: 70  },
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

function today() { return new Date().toISOString().split('T')[0] }
function nowDT()  { return new Date().toISOString().slice(0, 16) }
function uid()    { return 'ORD-' + String(Date.now()).slice(-6) }

/* ── Create Order Modal ────────────────────────────────────── */
const EMPTY_FORM = {
  OrderNo: '', SOrderNo: '', SOrderDateTime: '', ReadyForDeliveryDate: '',
  GatePassDate: '', BillingDate: '', CreatedOn: '', DespatchThrough: '',
  BuyresRef: '', DespDate: '', CompanyID: '', CompanyName: '', Godown: '',
  AccountName: '', ProductName: '', Qty: '', Qty_Billed: '0',
  PendingQty: '', BillQty: '0', BillPkgs: '0', BillNo: '', ImgUrl: '',
}

function CreateOrderModal({ onSubmit, onClose }) {
  const generatedId = useMemo(() => uid(), [])
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    OrderNo: `ON-${generatedId}`,
    SOrderNo: `SO-${generatedId}`,
    CreatedOn: today(),
    SOrderDateTime: nowDT(),
  })
  const [imgPreview, setImgPreview] = useState('')
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  // Auto-sync PendingQty = Qty when Qty changes
  const set = (k, v) => {
    setForm(p => {
      const next = { ...p, [k]: v }
      if (k === 'Qty') next.PendingQty = v
      if (k === 'CompanyID') {
        const co = COMPANIES_LIST.find(c => c.id === v)
        if (co) { next.CompanyName = co.name; next.AccountName = co.name }
      }
      return next
    })
    setErrors(p => ({ ...p, [k]: '' }))
  }

  const handleImgChange = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setImgPreview(ev.target.result)
      setForm(p => ({ ...p, ImgUrl: ev.target.result }))
    }
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const e = {}
    if (!form.OrderNo.trim())   e.OrderNo   = 'Order No is required'
    if (!form.SOrderNo.trim())  e.SOrderNo  = 'S.Order No is required'
    if (!form.ProductName)      e.ProductName = 'Product Name is required'
    if (!form.CompanyID)        e.CompanyID = 'Company is required'
    if (!form.Qty || isNaN(Number(form.Qty)) || Number(form.Qty) <= 0)
      e.Qty = 'Qty must be a positive number'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const qty = Number(form.Qty)
    const orderData = {
      ...form,
      id: generatedId,
      Qty:       qty,
      Qty_Billed: 0,
      PendingQty: qty,
      BillQty:   0,
      BillPkgs:  0,
      BillNo:    form.BillNo || '—',
      ImgUrl:    imgPreview || form.ImgUrl || `https://picsum.photos/seed/${generatedId}/300/300`,
      workflowHistory: [],
    }

    onSubmit(orderData)
    setSuccess(true)
    setTimeout(() => { setSuccess(false); onClose() }, 1200)
  }

  return (
    <div className="form-modal-backdrop" onClick={onClose}>
      <div className="form-modal form-modal-lg" style={{ maxWidth: 820 }} onClick={ev => ev.stopPropagation()}>
        <div className="form-modal-header">
          <div className="form-modal-title">
            <Plus size={17} /> Create New Order
          </div>
          <button className="form-modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        {success ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success-dark)' }}>Order Created Successfully!</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 6 }}>Added to Order Details Pending.</div>
          </div>
        ) : (
          <>
            <div className="form-modal-body">
              {/* Order Identifiers */}
              <div className="form-section-title">Order Identifiers</div>
              <div className="form-row form-row-3">
                <div className="form-group">
                  <label className="form-label">Order No <span className="form-required">*</span></label>
                  <input type="text" className="form-input" value={form.OrderNo} onChange={e => set('OrderNo', e.target.value)} />
                  {errors.OrderNo && <span className="form-error">{errors.OrderNo}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">S.Order No <span className="form-required">*</span></label>
                  <input type="text" className="form-input" value={form.SOrderNo} onChange={e => set('SOrderNo', e.target.value)} />
                  {errors.SOrderNo && <span className="form-error">{errors.SOrderNo}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Buyer's Ref</label>
                  <input type="text" className="form-input" value={form.BuyresRef} onChange={e => set('BuyresRef', e.target.value)} />
                </div>
              </div>

              {/* Company & Product */}
              <div className="form-section-title">Company &amp; Product</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company <span className="form-required">*</span></label>
                  <select className="form-select form-input" value={form.CompanyID} onChange={e => set('CompanyID', e.target.value)}>
                    <option value="">Select Company</option>
                    {COMPANIES_LIST.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.CompanyID && <span className="form-error">{errors.CompanyID}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Account Name</label>
                  <input type="text" className="form-input" value={form.AccountName} onChange={e => set('AccountName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Name <span className="form-required">*</span></label>
                  <select className="form-select form-input" value={form.ProductName} onChange={e => set('ProductName', e.target.value)}>
                    <option value="">Select Product</option>
                    {PRODUCTS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.ProductName && <span className="form-error">{errors.ProductName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Godown</label>
                  <select className="form-select form-input" value={form.Godown} onChange={e => set('Godown', e.target.value)}>
                    <option value="">Select Godown</option>
                    {GODOWNS_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Quantities */}
              <div className="form-section-title">Quantity</div>
              <div className="form-row form-row-3">
                <div className="form-group">
                  <label className="form-label">Qty <span className="form-required">*</span></label>
                  <input type="number" min="1" className="form-input" value={form.Qty} onChange={e => set('Qty', e.target.value)} />
                  {errors.Qty && <span className="form-error">{errors.Qty}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Pending Qty</label>
                  <input type="number" className="form-input" value={form.PendingQty} readOnly />
                  <span className="form-hint">Auto-filled from Qty</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Bill No</label>
                  <input type="text" className="form-input" value={form.BillNo} onChange={e => set('BillNo', e.target.value)} />
                </div>
              </div>

              {/* Dates */}
              <div className="form-section-title">Dates</div>
              <div className="form-row form-row-3">
                <div className="form-group">
                  <label className="form-label">Created On</label>
                  <input type="date" className="form-input" value={form.CreatedOn} onChange={e => set('CreatedOn', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">S.Order Date &amp; Time</label>
                  <input type="datetime-local" className="form-input" value={form.SOrderDateTime} onChange={e => set('SOrderDateTime', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">RFD Date</label>
                  <input type="date" className="form-input" value={form.ReadyForDeliveryDate} onChange={e => set('ReadyForDeliveryDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Billing Date</label>
                  <input type="date" className="form-input" value={form.BillingDate} onChange={e => set('BillingDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gate Pass Date</label>
                  <input type="date" className="form-input" value={form.GatePassDate} onChange={e => set('GatePassDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Despatch Date</label>
                  <input type="date" className="form-input" value={form.DespDate} onChange={e => set('DespDate', e.target.value)} />
                </div>
              </div>

              {/* Despatch */}
              <div className="form-section-title">Despatch</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Despatch Through</label>
                  <select className="form-select form-input" value={form.DespatchThrough} onChange={e => set('DespatchThrough', e.target.value)}>
                    <option value="">Select</option>
                    {DESPATCH_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input type="url" className="form-input" placeholder="https://..." value={form.ImgUrl}
                    onChange={e => set('ImgUrl', e.target.value)} />
                </div>
                <div className="form-group form-col-span-2">
                  <label className="form-label">Upload Image</label>
                  <input type="file" accept="image/*" className="form-input" style={{ padding: '6px 10px' }} onChange={handleImgChange} />
                  {(imgPreview || form.ImgUrl) && (
                    <img src={imgPreview || form.ImgUrl} alt="preview"
                      style={{ marginTop: 8, height: 70, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)' }} />
                  )}
                </div>
              </div>
            </div>

            <div className="form-modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSubmit}>
                <Plus size={13} /> Create Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── View Modal ────────────────────────────────────────────── */
function ViewModal({ order, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="view-modal-backdrop" onClick={onClose}>
      <div className="view-modal" onClick={ev => ev.stopPropagation()}>
        <div className="view-modal-header">
          <div className="view-modal-title">
            <FileText size={18} /> Order Details — {order.OrderNo}
          </div>
          <button className="view-modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="view-modal-body">
          <div className="vm-section-title">Order Information</div>
          <div className="vm-grid">
            {[
              ['Order No',        order.OrderNo,                 true],
              ['S.Order No',      order.SOrderNo,                true],
              ['S.Order Date',    fmtDT(order.SOrderDateTime)],
              ['Company ID',      order.CompanyID],
              ['Company Name',    order.CompanyName],
              ['Account Name',    order.AccountName],
              ["Buyer's Ref",     order.BuyresRef],
              ['Status',          order.status?.replace(/_/g, ' ')],
            ].map(([label, val, mono]) => (
              <div key={label} className="vm-field">
                <div className="vm-field-label">{label}</div>
                <div className={`vm-field-value${mono ? ' mono' : ''}`}>{val || '—'}</div>
              </div>
            ))}
          </div>

          <div className="vm-section-title">Product Details</div>
          <div className="vm-grid">
            {[
              ['Product Name',  order.ProductName],
              ['Quantity',      order.Qty],
            ].map(([label, val]) => (
              <div key={label} className="vm-field">
                <div className="vm-field-label">{label}</div>
                <div className="vm-field-value">{val === 0 ? '0' : (val || '—')}</div>
              </div>
            ))}
          </div>

          <div className="vm-section-title">Workflow History</div>
          {order.workflowHistory?.length > 0 ? (
            <div className="vm-history">
              {order.workflowHistory.map((h, i) => (
                <div key={i} className="vm-history-item">
                  <div className="vm-history-dot" />
                  <div className="vm-history-info">
                    <div className="vm-history-stage">Approved from {h.label}</div>
                    <div className="vm-history-meta">By: {h.approvedBy} &bull; {fmtDT(h.approvedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="vm-no-history">No approvals recorded yet.</div>
          )}
        </div>
        <div className="view-modal-footer">
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

/* ── Filter helper ─────────────────────────────────────────── */
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
        o.CompanyName.toLowerCase().includes(s) ||
        o.AccountName.toLowerCase().includes(s) ||
        (o.BillNo && o.BillNo.toLowerCase().includes(s))
      )
    }
    return true
  })
}

/* ── Page ──────────────────────────────────────────────────── */
export default function OrderDetails() {
  const { orders, createOrder } = useOrderContext()
  const [search, setSearch] = useState('')
  const [company, setCompany] = useState('')
  const [product, setProduct] = useState('')
  const [godown, setGodown] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [orderNo, setOrderNo] = useState('')
  const [sOrderNo, setSOrderNo] = useState('')
  const [viewOrder, setViewOrder] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const filters    = { search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo }

  const activeData = useMemo(() => filterOrders(orders, filters), [orders, search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo])

  const clearFilters = () => {
    setSearch(''); setCompany(''); setProduct(''); setGodown('')
    setDateFrom(''); setDateTo(''); setOrderNo(''); setSOrderNo('')
  }

  return (
    <div className="page-wrapper">
      {/* Header row */}
      <div className="page-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>

          <h1 className="page-title">Order Details</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> Create Order
        </button>
      </div>

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
        emptyMessage={'No orders found.'}
        emptySubMessage="Try adjusting your filters or create a new order."
      />

      {viewOrder   && <ViewModal order={viewOrder} onClose={() => setViewOrder(null)} />}
      {showCreate  && (
        <CreateOrderModal
          onSubmit={data => createOrder(data)}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}
