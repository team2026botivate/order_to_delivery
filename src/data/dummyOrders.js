const COMPANIES = [
  { id: 'COMP-001', name: 'Tata Steel Ltd' },
  { id: 'COMP-002', name: 'Birla Industries' },
  { id: 'COMP-003', name: 'Reliance Trading Co' },
  { id: 'COMP-004', name: 'Mahindra Exports' },
  { id: 'COMP-005', name: 'Godrej Manufacturing' },
  { id: 'COMP-006', name: 'Wipro Textiles' },
  { id: 'COMP-007', name: 'L&T Constructions' },
  { id: 'COMP-008', name: 'Bajaj Auto Parts' },
  { id: 'COMP-009', name: 'HDFC Logistics' },
  { id: 'COMP-010', name: 'Infosys Supplies' },
]

const PRODUCTS = [
  'Steel Pipes', 'Iron Rods', 'Aluminum Sheets', 'Copper Wires',
  'PVC Pipes', 'Cement Bags', 'Electronic Components', 'Textile Fabric',
  'Chemical Drums', 'Glass Panels', 'Rubber Seals', 'Stainless Tubes',
  'Plastic Granules', 'Wooden Pallets', 'Brass Fittings',
]

const DESPATCH = ['Road Transport', 'Rail Freight', 'Air Cargo', 'Sea Freight', 'Courier Service']
const GODOWNS = ['Main Warehouse', 'Sector-A Godown', 'North Godown', 'South Godown', 'Central Store']
const APPROVERS = ['Admin User', 'Manager Singh', 'Supervisor Patel', 'Manager Rao', 'Supervisor Khan']

const STATUSES = [
  'ORDER_DETAILS_PENDING',
  'READY_FOR_DELIVERY_PENDING',
  'BILLING_PENDING',
  'GATE_PASS_PENDING',
  'AUDIT_PENDING',
  'FEEDBACK_PENDING',
  'COMPLETED',
]

function pad(n, len = 2) { return String(n).padStart(len, '0') }

function addDays(base, n) {
  const d = new Date(base + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function makeOrder(idx, statusIdx) {
  const comp = COMPANIES[idx % COMPANIES.length]
  const product = PRODUCTS[idx % PRODUCTS.length]
  const month = (idx % 10) + 1
  const day = (idx % 25) + 1
  const base = `2024-${pad(month)}-${pad(day)}`
  const qty = 50 + ((idx * 37) % 450) + 10
  const isBilled = statusIdx >= 2
  const billQty = isBilled ? qty : 0

  const workflowHistory = []
  if (statusIdx >= 1) workflowHistory.push({
    stage: 'ORDER_DETAILS_PENDING',
    label: 'Order Details',
    approvedAt: addDays(base, 1) + 'T09:30:00.000Z',
    approvedBy: APPROVERS[idx % APPROVERS.length],
  })
  if (statusIdx >= 2) workflowHistory.push({
    stage: 'READY_FOR_DELIVERY_PENDING',
    label: 'Ready For Delivery',
    approvedAt: addDays(base, 3) + 'T10:45:00.000Z',
    approvedBy: APPROVERS[(idx + 1) % APPROVERS.length],
  })
  if (statusIdx >= 3) workflowHistory.push({
    stage: 'BILLING_PENDING',
    label: 'Billing',
    approvedAt: addDays(base, 5) + 'T11:15:00.000Z',
    approvedBy: APPROVERS[(idx + 2) % APPROVERS.length],
  })
  if (statusIdx >= 4) workflowHistory.push({
    stage: 'GATE_PASS_PENDING',
    label: 'Gate Pass Out',
    approvedAt: addDays(base, 7) + 'T14:00:00.000Z',
    approvedBy: APPROVERS[(idx + 3) % APPROVERS.length],
  })
  if (statusIdx >= 5) workflowHistory.push({
    stage: 'AUDIT_PENDING',
    label: 'Audit',
    approvedAt: addDays(base, 8) + 'T15:00:00.000Z',
    approvedBy: APPROVERS[(idx + 4) % APPROVERS.length],
    auditPassed: true,
  })
  if (statusIdx >= 6) workflowHistory.push({
    stage: 'FEEDBACK_PENDING',
    label: 'Feedback',
    approvedAt: addDays(base, 9) + 'T10:00:00.000Z',
    approvedBy: APPROVERS[(idx + 5) % APPROVERS.length],
    feedbackText: 'Great product and quick delivery.',
  })

  return {
    id: `ORD-${pad(idx + 1, 3)}`,
    OrderNo: `ON-2024-${pad(idx + 1, 4)}`,
    SOrderNo: `SO-${pad(idx + 100, 4)}`,
    SOrderDateTime: base + 'T08:30:00',
    ReadyForDeliveryDate: addDays(base, 5),
    GatePassDate: addDays(base, 8),
    BillingDate: addDays(base, 6),
    CreatedOn: base,
    DespatchThrough: DESPATCH[idx % DESPATCH.length],
    BuyresRef: `BR-${pad(idx + 1, 3)}`,
    DespDate: addDays(base, 9),
    CompanyID: comp.id,
    CompanyName: comp.name,
    Godown: GODOWNS[idx % GODOWNS.length],
    AccountName: comp.name,
    ProductName: product,
    Qty: qty,
    Qty_Billed: billQty,
    PendingQty: qty - billQty,
    BillQty: billQty,
    BillPkgs: isBilled ? Math.ceil(qty / 10) : 0,
    BillNo: isBilled ? `BILL-${pad(idx + 1, 4)}` : '—',
    ImgUrl: `https://picsum.photos/seed/aceorder${idx + 1}/300/300`,
    status: STATUSES[statusIdx],
    previousStatus: null,
    workflowHistory,
  }
}

// Distribution to include Audit and Feedback
const dist = [
  ...Array(15).fill(1),
  ...Array(8).fill(2),
  ...Array(8).fill(3),
  ...Array(8).fill(4),
  ...Array(6).fill(5),
  ...Array(5).fill(6),
]

export const initialOrders = dist.map((si, i) => makeOrder(i, si))
export const COMPANIES_LIST = COMPANIES
export const PRODUCTS_LIST = PRODUCTS
export const GODOWNS_LIST = GODOWNS
