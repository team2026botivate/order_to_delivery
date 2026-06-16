import { useState, useMemo, useEffect } from 'react'
import { FileText, X, MessageSquare, CheckCircle2, Send, Star } from 'lucide-react'
import { useOrderContext } from '../../context/OrderContext'
import { COMPANIES_LIST, PRODUCTS_LIST, GODOWNS_LIST } from '../../data/dummyOrders'
import StatusTabs from '../../components/StatusTabs/StatusTabs'
import SearchFilterBar from '../../components/SearchFilterBar/SearchFilterBar'
import DataTable from '../../components/DataTable/DataTable'
import './Feedback.css'

const COLUMNS = [
  { key: 'SOrderNo',    label: 'S.Order No',     sortable: true },
  { key: 'ProductName', label: 'Product Name',   sortable: true },
  { key: 'Qty',         label: 'Qty',            sortable: true, type: 'number' },
  { key: 'OrderNo',     label: 'Order No',       sortable: true },
  { key: 'CreatedOn',   label: 'Created On',     sortable: true, type: 'date' },
]

function fmtDT(v) {
  if (!v) return '—'
  const d = new Date(v)
  if (isNaN(d)) return v
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

/* ── Star Rating ─────────────────────────────────────────── */
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="star-rating">
      <div className="star-scale-row">
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} className="star-scale-num">{n}</span>
        ))}
      </div>
      <div className="star-btn-row">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            className={`star-btn ${n <= (hovered || value) ? 'star-filled' : ''}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`Rate ${n} out of 5`}
          >
            <Star size={22} />
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Radio Group ─────────────────────────────────────────── */
function RadioGroup({ value, onChange, name }) {
  return (
    <div className="radio-group">
      {['Yes', 'No'].map(opt => (
        <label key={opt} className={`radio-option ${value === opt.toLowerCase() ? 'radio-selected' : ''}`}>
          <input
            type="radio"
            name={name}
            value={opt.toLowerCase()}
            checked={value === opt.toLowerCase()}
            onChange={() => onChange(opt.toLowerCase())}
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  )
}

const INITIAL_FORM = {
  onTimeDelivery: '',
  deliveryTeamRating: 0,
  packagingOk: '',
  materialCondition: 0,
  correctProduct: '',
  qualityOk: '',
  anyDamage: '',
  billCorrect: '',
  overallRating: 0,
  wouldReorder: '',
  comments: '',
}

/* ── Feedback Action Modal ───────────────────────────────── */
function FeedbackActionModal({ order, onSubmit, onClose }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.onTimeDelivery)    errs.onTimeDelivery    = 'Required'
    if (!form.deliveryTeamRating) errs.deliveryTeamRating = 'Required'
    if (!form.packagingOk)       errs.packagingOk       = 'Required'
    if (!form.materialCondition)  errs.materialCondition  = 'Required'
    if (!form.correctProduct)    errs.correctProduct    = 'Required'
    if (!form.qualityOk)         errs.qualityOk         = 'Required'
    if (!form.anyDamage)         errs.anyDamage         = 'Required'
    if (!form.billCorrect)       errs.billCorrect       = 'Required'
    if (!form.overallRating)     errs.overallRating     = 'Required'
    if (!form.wouldReorder)      errs.wouldReorder      = 'Required'
    return errs
  }

  const handleSubmit = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit(form)
  }

  return (
    <div className="form-modal-backdrop" onClick={onClose}>
      <div className="form-modal form-modal-lg" onClick={ev => ev.stopPropagation()}>
        <div className="form-modal-header">
          <div className="form-modal-title">
            <MessageSquare size={17} /> Feedback — {order.OrderNo}
          </div>
          <button className="form-modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="form-modal-body">
          <div className="info-grid" style={{ marginBottom: 4 }}>
            {[
              ['Order No',   order.OrderNo],
              ['S.Order No', order.SOrderNo],
              ['Product',    order.ProductName],
              ['Company',    order.CompanyName],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="info-item-label">{l}</div>
                <div className="info-item-value">{v === 0 ? '0' : (v || '—')}</div>
              </div>
            ))}
          </div>

          <div className="form-section-title">Delivery</div>

          <div className="fb-field">
            <div className="fb-field-label">On-time delivery? <span className="form-required">*</span></div>
            <RadioGroup value={form.onTimeDelivery} onChange={v => set('onTimeDelivery', v)} name="onTimeDelivery" />
            {errors.onTimeDelivery && <span className="form-error">{errors.onTimeDelivery}</span>}
          </div>

          <div className="fb-field">
            <div className="fb-field-label">Delivery team professional? <span className="form-required">*</span></div>
            <StarRating value={form.deliveryTeamRating} onChange={v => set('deliveryTeamRating', v)} />
            {errors.deliveryTeamRating && <span className="form-error">{errors.deliveryTeamRating}</span>}
          </div>

          <div className="form-section-title">Product & Packaging</div>

          <div className="fb-field">
            <div className="fb-field-label">Packaging OK? <span className="form-required">*</span></div>
            <RadioGroup value={form.packagingOk} onChange={v => set('packagingOk', v)} name="packagingOk" />
            {errors.packagingOk && <span className="form-error">{errors.packagingOk}</span>}
          </div>

          <div className="fb-field">
            <div className="fb-field-label">Material condition? <span className="form-required">*</span></div>
            <StarRating value={form.materialCondition} onChange={v => set('materialCondition', v)} />
            {errors.materialCondition && <span className="form-error">{errors.materialCondition}</span>}
          </div>

          <div className="fb-field">
            <div className="fb-field-label">Correct product? <span className="form-required">*</span></div>
            <RadioGroup value={form.correctProduct} onChange={v => set('correctProduct', v)} name="correctProduct" />
            {errors.correctProduct && <span className="form-error">{errors.correctProduct}</span>}
          </div>

          <div className="fb-field">
            <div className="fb-field-label">Quality OK? <span className="form-required">*</span></div>
            <RadioGroup value={form.qualityOk} onChange={v => set('qualityOk', v)} name="qualityOk" />
            {errors.qualityOk && <span className="form-error">{errors.qualityOk}</span>}
          </div>

          <div className="fb-field">
            <div className="fb-field-label">Any damage? <span className="form-required">*</span></div>
            <RadioGroup value={form.anyDamage} onChange={v => set('anyDamage', v)} name="anyDamage" />
            {errors.anyDamage && <span className="form-error">{errors.anyDamage}</span>}
          </div>

          <div className="form-section-title">Overall Experience</div>

          <div className="fb-field">
            <div className="fb-field-label">Bill correct? <span className="form-required">*</span></div>
            <RadioGroup value={form.billCorrect} onChange={v => set('billCorrect', v)} name="billCorrect" />
            {errors.billCorrect && <span className="form-error">{errors.billCorrect}</span>}
          </div>

          <div className="fb-field">
            <div className="fb-field-label">Overall Rating <span className="form-required">*</span></div>
            <StarRating value={form.overallRating} onChange={v => set('overallRating', v)} />
            {errors.overallRating && <span className="form-error">{errors.overallRating}</span>}
          </div>

          <div className="fb-field">
            <div className="fb-field-label">Would reorder? <span className="form-required">*</span></div>
            <RadioGroup value={form.wouldReorder} onChange={v => set('wouldReorder', v)} name="wouldReorder" />
            {errors.wouldReorder && <span className="form-error">{errors.wouldReorder}</span>}
          </div>

          <div className="fb-field">
            <div className="fb-field-label">Comments</div>
            <textarea
              className="form-textarea form-input"
              placeholder="Your answer"
              value={form.comments}
              onChange={e => set('comments', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="form-modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-success btn-sm" onClick={handleSubmit}>
            <Send size={13} /> Submit Feedback
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

  const fd = order.feedbackData

  return (
    <div className="form-modal-backdrop" onClick={onClose}>
      <div className="form-modal form-modal-lg" onClick={ev => ev.stopPropagation()}>
        <div className="form-modal-header">
          <div className="form-modal-title"><FileText size={16} /> {order.OrderNo} — Order Details</div>
          <button className="form-modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="form-modal-body">
          <div className="info-grid">
            {[
              ['Order No', order.OrderNo], ['S.Order No', order.SOrderNo],
              ['Product', order.ProductName], ['Company', order.CompanyName],
              ['Qty', order.Qty], ['Status', order.status?.replace(/_/g, ' ')],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="info-item-label">{l}</div>
                <div className="info-item-value">{v === 0 ? '0' : (v || '—')}</div>
              </div>
            ))}
          </div>

          {fd && (
            <>
              <div className="form-section-title">Feedback Provided</div>
              <div className="fb-view-grid">
                {[
                  ['On-time delivery',       fd.onTimeDelivery],
                  ['Delivery team rating',   `${fd.deliveryTeamRating} / 5`],
                  ['Packaging OK',           fd.packagingOk],
                  ['Material condition',     `${fd.materialCondition} / 5`],
                  ['Correct product',        fd.correctProduct],
                  ['Quality OK',             fd.qualityOk],
                  ['Any damage',             fd.anyDamage],
                  ['Bill correct',           fd.billCorrect],
                  ['Overall rating',         `${fd.overallRating} / 5`],
                  ['Would reorder',          fd.wouldReorder],
                ].map(([label, val]) => (
                  <div key={label} className="fb-view-item">
                    <span className="fb-view-label">{label}</span>
                    <span className="fb-view-value">
                      {typeof val === 'string' ? val.charAt(0).toUpperCase() + val.slice(1) : val}
                    </span>
                  </div>
                ))}
                {fd.comments && (
                  <div className="fb-view-item fb-view-full">
                    <span className="fb-view-label">Comments</span>
                    <span className="fb-view-value">{fd.comments}</span>
                  </div>
                )}
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
export default function Feedback() {
  const { getPendingByStage, getHistoryByStage, submitFeedback } = useOrderContext()
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

  const pendingRaw = getPendingByStage('FEEDBACK_PENDING')
  const historyRaw = getHistoryByStage('FEEDBACK_PENDING')
  const filters = { search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo }

  const pending = useMemo(() => filterOrders(pendingRaw, filters), [pendingRaw, search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo])
  const history = useMemo(() => filterOrders(historyRaw, filters), [historyRaw, search, company, product, godown, dateFrom, dateTo, orderNo, sOrderNo])
  const activeData = tab === 'pending' ? pending : history

  const clearFilters = () => {
    setSearch(''); setCompany(''); setProduct(''); setGodown('')
    setDateFrom(''); setDateTo(''); setOrderNo(''); setSOrderNo('')
  }

  const handleActionSubmit = (feedbackData) => {
    submitFeedback(actionOrder.id, feedbackData)
    setActionOrder(null)
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageSquare size={22} style={{ color: '#eab308' }} />
          Feedback
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
          All feedbacks have been submitted.
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
        actionLabel="Feedback"
        emptyMessage={tab === 'pending' ? 'No orders pending feedback.' : 'No completed feedbacks yet.'}
        emptySubMessage="Orders appear here once audited."
      />

      {viewOrder && <ViewModal order={viewOrder} onClose={() => setViewOrder(null)} />}
      {actionOrder && <FeedbackActionModal order={actionOrder} onSubmit={handleActionSubmit} onClose={() => setActionOrder(null)} />}
    </div>
  )
}
