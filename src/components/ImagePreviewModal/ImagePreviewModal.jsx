import { useEffect } from 'react'
import { X, ImageIcon } from 'lucide-react'
import './ImagePreviewModal.css'

export default function ImagePreviewModal({ url, label, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!url) return null

  return (
    <div className="img-modal-backdrop" onClick={onClose}>
      <div className="img-modal-container" onClick={e => e.stopPropagation()}>
        <div className="img-modal-header">
          <span className="img-modal-title">{label || 'Image Preview'}</span>
          <button className="img-modal-close" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <div className="img-modal-body">
          <img src={url} alt={label || 'Preview'} />
        </div>
        <div className="img-modal-footer">Click outside or press Esc to close</div>
      </div>
    </div>
  )
}

export function ImageThumb({ url, label, onClick }) {
  if (!url || url === '—') {
    return (
      <div className="img-no-image">
        <ImageIcon size={16} />
      </div>
    )
  }
  return (
    <img
      className="img-thumbnail"
      src={url}
      alt={label || 'preview'}
      onClick={onClick}
      title="Click to preview"
    />
  )
}
