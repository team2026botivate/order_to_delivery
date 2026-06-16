export const DISPATCHED_STATUSES = new Set(['AUDIT_PENDING', 'FEEDBACK_PENDING', 'COMPLETED'])
export const DELIVERY_STATUS_OPTIONS = ['On Time', 'Delayed', 'Pending', 'Overdue']

export function getToday() {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d
}

export function getDateStr(v) {
  if (!v) return null
  const d = new Date(v)
  return isNaN(d) ? null : d.toISOString().split('T')[0]
}

export function fmtDate(v) {
  if (!v) return '—'
  const d = new Date(v)
  return isNaN(d) ? v : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function getWeekNo(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d)) return null
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  const w1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d - w1) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7)
}

export function isDispatched(o) { return DISPATCHED_STATUSES.has(o.status) }

export function isOnTime(o) {
  if (!isDispatched(o)) return false
  const gp = getDateStr(o.GatePassDate), dp = getDateStr(o.DespDate)
  return !!(gp && dp && gp <= dp)
}

export function isSameDay(o) {
  if (!isDispatched(o)) return false
  const gp = getDateStr(o.GatePassDate), cr = getDateStr(o.CreatedOn)
  return !!(gp && cr && gp === cr)
}

export function isOverdue(o) {
  if (isDispatched(o)) return false
  const dp = getDateStr(o.DespDate)
  return !!(dp && new Date(dp) < getToday())
}

export function getDeliveryStatus(o) {
  if (isDispatched(o)) return isOnTime(o) ? 'On Time' : 'Delayed'
  return isOverdue(o) ? 'Overdue' : 'Pending'
}

export function pct(n, d) { return d > 0 ? Math.round((n / d) * 100) : 0 }
