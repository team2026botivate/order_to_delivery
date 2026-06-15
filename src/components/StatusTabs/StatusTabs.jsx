import { Clock, History } from 'lucide-react'
import './StatusTabs.css'

export default function StatusTabs({ activeTab, onTabChange, pendingCount, historyCount }) {
  return (
    <div className="status-tabs">
      <button
        className={`status-tab${activeTab === 'pending' ? ' active' : ''}`}
        onClick={() => onTabChange('pending')}
      >
        <Clock size={15} />
        Pending
        <span className="status-tab-count">{pendingCount ?? 0}</span>
      </button>
      <button
        className={`status-tab${activeTab === 'history' ? ' active' : ''}`}
        onClick={() => onTabChange('history')}
      >
        <History size={15} />
        History
        <span className="status-tab-count">{historyCount ?? 0}</span>
      </button>
    </div>
  )
}
