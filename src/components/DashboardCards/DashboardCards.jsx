import { Package, Clock, Truck, Receipt, LogOut, CheckCircle2, GitMerge } from 'lucide-react'
import './DashboardCards.css'

const KPI_CONFIG = [
  { key: 'total',                  label: 'Total Orders',              iconClass: 'total',    Icon: Package },
  { key: 'orderDetailsPending',    label: 'Order Details Pending',     iconClass: 'pending',  Icon: Clock },
  { key: 'readyForDeliveryPending',label: 'Ready For Delivery',        iconClass: 'rfd',      Icon: Truck },
  { key: 'billingPending',         label: 'Billing Pending',           iconClass: 'billing',  Icon: Receipt },
  { key: 'gatePassPending',        label: 'Gate Pass Pending',         iconClass: 'gatepass', Icon: LogOut },
  { key: 'auditPending',           label: 'Audit Pending',             iconClass: 'billing',  Icon: CheckCircle2 },
  { key: 'feedbackPending',        label: 'Feedback Pending',          iconClass: 'gatepass', Icon: CheckCircle2 },
  { key: 'completed',              label: 'Completed Orders',          iconClass: 'complete', Icon: CheckCircle2 },
]

const PIPELINE = [
  { label: 'Order Details',       colorClass: 'c1', statKey: 'orderDetailsPending' },
  { label: 'Ready For Delivery',  colorClass: 'c2', statKey: 'readyForDeliveryPending' },
  { label: 'Billing',             colorClass: 'c3', statKey: 'billingPending' },
  { label: 'Gate Pass Out',       colorClass: 'c4', statKey: 'gatePassPending' },
  { label: 'Audit',               colorClass: 'c5', statKey: 'auditPending' },
  { label: 'Feedback',            colorClass: 'c6', statKey: 'feedbackPending' },
  { label: 'Completed',           colorClass: 'c7', statKey: 'completed' },
]

export function KpiCards({ stats }) {
  return (
    <div className="kpi-grid">
      {KPI_CONFIG.map(({ key, label, iconClass, Icon }) => (
        <div key={key} className="kpi-card">
          <div className={`kpi-icon ${iconClass}`}>
            <Icon size={20} strokeWidth={2} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{stats[key] ?? 0}</div>
            <div className="kpi-label">{label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function WorkflowPipeline({ stats }) {
  return (
    <div className="workflow-pipeline">
      <div className="workflow-pipeline-title">
        <GitMerge size={16} />
        Order Workflow Pipeline
      </div>
      <div className="pipeline-steps">
        {PIPELINE.map((step, idx) => (
          <div key={step.label} style={{ display: 'flex', alignItems: 'flex-start', flex: idx < PIPELINE.length - 1 ? 1 : 'none' }}>
            <div className="pipeline-step">
              <div className={`pipeline-step-circle ${step.colorClass}`}>
                {idx + 1}
              </div>
              <div className="pipeline-step-label">{step.label}</div>
              <div className="pipeline-step-count">
                {stats[step.statKey]} order{stats[step.statKey] !== 1 ? 's' : ''}
              </div>
            </div>
            {idx < PIPELINE.length - 1 && <div className="pipeline-arrow" />}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardCards({ stats }) {
  return (
    <>
      <KpiCards stats={stats} />
      <WorkflowPipeline stats={stats} />
    </>
  )
}
