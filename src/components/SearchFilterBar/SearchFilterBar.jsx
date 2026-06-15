import { Search, X, SlidersHorizontal } from 'lucide-react'
import './SearchFilterBar.css'

export default function SearchFilterBar({
  // existing
  search = '', onSearch,
  company = '', onCompany, companies = [],
  product = '', onProduct, products = [],
  dateFrom = '', onDateFrom,
  dateTo = '', onDateTo,
  totalResults,
  onClear,
  // optional new filters — only rendered if handler is provided
  orderNo = '', onOrderNo,
  sOrderNo = '', onSOrderNo,
  godown = '', onGodown, godowns = [],
  status = '', onStatus, statuses = [],
}) {
  const hasFilters = search || company || product || dateFrom || dateTo ||
    orderNo || sOrderNo || godown || status

  return (
    <div className="sfb-wrapper">
      {/* Row 1: search + dropdowns */}
      <div className="sfb-row">
        <div className="sfb-search">
          <span className="sfb-search-icon"><Search size={14} /></span>
          <input
            type="text"
            placeholder="Search orders, products, companies..."
            value={search}
            onChange={e => onSearch && onSearch(e.target.value)}
          />
        </div>

        <div className="sfb-filters">
          {onCompany && (
            <select className="sfb-select" value={company} onChange={e => onCompany(e.target.value)}>
              <option value="">All Companies</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}

          {onProduct && (
            <select className="sfb-select" value={product} onChange={e => onProduct(e.target.value)}>
              <option value="">All Products</option>
              {products.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}

          {onGodown && (
            <select className="sfb-select" value={godown} onChange={e => onGodown(e.target.value)}>
              <option value="">All Godowns</option>
              {godowns.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          )}

          {onStatus && (
            <select className="sfb-select" value={status} onChange={e => onStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          )}

          <div className="sfb-date-group">
            <span className="sfb-date-label">From</span>
            <input type="date" className="sfb-date" value={dateFrom} onChange={e => onDateFrom && onDateFrom(e.target.value)} />
            <span className="sfb-date-label">To</span>
            <input type="date" className="sfb-date" value={dateTo} onChange={e => onDateTo && onDateTo(e.target.value)} />
          </div>

          {hasFilters && (
            <button className="sfb-clear-btn" onClick={onClear}>
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Row 2: extra text filters (Order No / S.Order No) */}
      {(onOrderNo || onSOrderNo) && (
        <div className="sfb-row sfb-row-secondary">
          <span className="sfb-extra-label"><SlidersHorizontal size={13} /> Quick Filters:</span>
          {onOrderNo && (
            <input
              type="text"
              className="sfb-text-filter"
              placeholder="Filter by Order No…"
              value={orderNo}
              onChange={e => onOrderNo(e.target.value)}
            />
          )}
          {onSOrderNo && (
            <input
              type="text"
              className="sfb-text-filter"
              placeholder="Filter by S.Order No…"
              value={sOrderNo}
              onChange={e => onSOrderNo(e.target.value)}
            />
          )}
        </div>
      )}

      {totalResults !== undefined && (
        <div className="sfb-results">
          Showing <strong>{totalResults}</strong> record{totalResults !== 1 ? 's' : ''}
          {hasFilters && <span> (filtered)</span>}
        </div>
      )}
    </div>
  )
}
