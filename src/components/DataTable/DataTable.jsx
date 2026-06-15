import { useState, useMemo } from 'react'
import { Eye, CheckCircle, X, ChevronUp, ChevronDown, ChevronsUpDown, Inbox, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import ImagePreviewModal, { ImageThumb } from '../ImagePreviewModal/ImagePreviewModal'
import './DataTable.css'

function formatDate(val) {
  if (!val || val === '—') return '—'
  const d = new Date(val)
  if (isNaN(d)) return val
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(val) {
  if (!val || val === '—') return '—'
  const d = new Date(val)
  if (isNaN(d)) return val
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function CellValue({ col, value, row, onImageClick }) {
  if (col.type === 'image') {
    return <ImageThumb url={value} label={row.OrderNo} onClick={() => onImageClick(value, row.OrderNo)} />
  }
  if (col.type === 'date') return <span className="dt-date">{formatDate(value)}</span>
  if (col.type === 'datetime') return <span className="dt-date">{formatDateTime(value)}</span>
  if (col.type === 'number') return <span className="dt-number">{value ?? '—'}</span>
  if (col.key === 'OrderNo' || col.key === 'SOrderNo') return <span className="dt-order-no">{value}</span>
  if (col.render) return col.render(value, row)
  return <span>{value === '' || value === null || value === undefined ? '—' : value}</span>
}

const ITEMS_PER_PAGE = 10

export default function DataTable({
  columns = [],
  data = [],
  onView,
  onApprove,
  showApprove = false,
  instantApprove = false,
  onAction,
  actionLabel = 'Action',
  loading = false,
  emptyMessage = 'No records found.',
  emptySubMessage = 'Try adjusting your search or filters.',
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [confirmId, setConfirmId] = useState(null)
  const [previewImg, setPreviewImg] = useState(null)
  const [previewLabel, setPreviewLabel] = useState('')

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const pageData = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleSort = key => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const handleApproveClick = row => {
    if (confirmId === row.id) {
      onApprove && onApprove(row)
      setConfirmId(null)
    } else {
      setConfirmId(row.id)
    }
  }

  const pageNumbers = () => {
    const pages = []
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, start + 4)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  if (loading) {
    return (
      <div className="dt-wrapper">
        <div className="dt-loading">
          <div className="dt-spinner" />
          <div>Loading records...</div>
        </div>
      </div>
    )
  }

  const start = (currentPage - 1) * ITEMS_PER_PAGE + 1
  const end = Math.min(currentPage * ITEMS_PER_PAGE, sorted.length)

  return (
    <>
      <div className="dt-wrapper">
        <div className="dt-scroll">
          <table className="dt-table">
            <thead className="dt-thead">
              <tr>
                <th className="dt-th" style={{ width: 40 }}>#</th>
                {(onView || (showApprove && onApprove) || onAction) && (
                  <th className="dt-th" style={{ width: showApprove ? 180 : onAction ? 160 : 80 }}>Action</th>
                )}
                {columns.map(col => (
                  <th
                    key={col.key}
                    className={`dt-th${col.sortable ? ' sortable' : ''}${sortKey === col.key ? ' sorted' : ''}`}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    style={col.width ? { width: col.width } : {}}
                  >
                    <div className="dt-th-content">
                      {col.label}
                      {col.sortable && (
                        <span className="dt-sort-icon">
                          {sortKey === col.key
                            ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                            : <ChevronsUpDown size={12} />}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="dt-tbody">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2}>
                    <div className="dt-empty">
                      <div className="dt-empty-icon"><Inbox size={24} /></div>
                      <div className="dt-empty-title">{emptyMessage}</div>
                      <div className="dt-empty-sub">{emptySubMessage}</div>
                    </div>
                  </td>
                </tr>
              ) : (
                pageData.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="dt-td center" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                      {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </td>
                    {(onView || (showApprove && onApprove) || onAction) && (
                      <td className="dt-td">
                        <div className="dt-actions">
                          {onView && (
                            <button className="dt-btn dt-btn-view" onClick={() => onView(row)}>
                              <Eye size={12} /> View
                            </button>
                          )}
                          {onAction && (
                            <button className="dt-btn dt-btn-action" onClick={() => onAction(row)}>
                              <Zap size={12} /> {actionLabel}
                            </button>
                          )}
                          {showApprove && onApprove && (
                            !instantApprove && confirmId === row.id ? (
                              <div className="dt-confirm-inline">
                                <span className="dt-confirm-text">Confirm?</span>
                                <button className="dt-btn dt-btn-confirm" onClick={() => handleApproveClick(row)}>
                                  <CheckCircle size={12} /> Yes
                                </button>
                                <button className="dt-btn dt-btn-cancel" onClick={() => setConfirmId(null)}>
                                  <X size={12} /> No
                                </button>
                              </div>
                            ) : (
                              <button className="dt-btn dt-btn-approve" onClick={() => instantApprove ? onApprove(row) : setConfirmId(row.id)}>
                                <CheckCircle size={12} /> Approve
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    )}
                    {columns.map(col => (
                      <td key={col.key} className="dt-td">
                        <CellValue
                          col={col}
                          value={row[col.key]}
                          row={row}
                          onImageClick={(url, label) => { setPreviewImg(url); setPreviewLabel(label) }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {sorted.length > 0 && (
          <div className="dt-pagination">
            <div className="dt-pagination-info">
              Showing <strong>{start}–{end}</strong> of <strong>{sorted.length}</strong> records
            </div>
            <div className="dt-pagination-controls">
              <button
                className="dt-page-btn"
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                title="First page"
              >
                «
              </button>
              <button
                className="dt-page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} />
              </button>
              {pageNumbers().map(n => (
                <button
                  key={n}
                  className={`dt-page-btn${n === currentPage ? ' active' : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="dt-page-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={14} />
              </button>
              <button
                className="dt-page-btn"
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
                title="Last page"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {previewImg && (
        <ImagePreviewModal
          url={previewImg}
          label={previewLabel}
          onClose={() => { setPreviewImg(null); setPreviewLabel('') }}
        />
      )}
    </>
  )
}
