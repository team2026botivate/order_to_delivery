import { createContext, useContext, useReducer } from 'react'
import { initialOrders } from '../data/dummyOrders'

export const STATUS_LEVEL = {
  ORDER_DETAILS_PENDING: 1,
  READY_FOR_DELIVERY_PENDING: 2,
  BILLING_PENDING: 3,
  BILLING_FULLY_PROCESSED: 3.5,
  GATE_PASS_PENDING: 4,
  AUDIT_PENDING: 5,
  FEEDBACK_PENDING: 6,
  COMPLETED: 7,
}

// Used by simple Approve (Order Details only)
const NEXT_STATUS = {
  ORDER_DETAILS_PENDING: 'READY_FOR_DELIVERY_PENDING',
}

export const STAGE_LABELS = {
  ORDER_DETAILS_PENDING: 'Order Details',
  READY_FOR_DELIVERY_PENDING: 'Ready For Delivery',
  BILLING_PENDING: 'Billing',
  BILLING_FULLY_PROCESSED: 'Billing (Fully Processed)',
  GATE_PASS_PENDING: 'Gate Pass Out',
  AUDIT_PENDING: 'Audit',
  FEEDBACK_PENDING: 'Feedback',
  COMPLETED: 'Completed',
}

function reducer(state, action) {
  switch (action.type) {

    case 'APPROVE': {
      const { id, approvedBy } = action.payload
      const now = new Date().toISOString()
      return state.map(order => {
        if (order.id !== id) return order
        const prevStatus = order.status
        const nextStatus = NEXT_STATUS[prevStatus]
        if (!nextStatus) return order
        return {
          ...order,
          previousStatus: prevStatus,
          status: nextStatus,
          workflowHistory: [
            ...order.workflowHistory,
            { stage: prevStatus, label: STAGE_LABELS[prevStatus], approvedAt: now, approvedBy },
          ],
        }
      })
    }

    case 'SUBMIT_RFD': {
      const { id, formData, approvedBy = 'Admin User' } = action.payload
      const now = new Date().toISOString()
      return state.map(o => {
        if (o.id !== id) return o
        return {
          ...o,
          status: 'BILLING_PENDING',
          previousStatus: 'READY_FOR_DELIVERY_PENDING',
          ReadyForDeliveryDate: formData.deliveryDate || o.ReadyForDeliveryDate,
          rfdData: formData,
          workflowHistory: [
            ...o.workflowHistory,
            {
              stage: 'READY_FOR_DELIVERY_PENDING',
              label: 'Ready For Delivery',
              approvedAt: now,
              approvedBy,
              formData,
            },
          ],
        }
      })
    }

    case 'SUBMIT_BILLING': {
      const { id, formData, approvedBy = 'Admin User' } = action.payload
      const now = new Date().toISOString()
      const order = state.find(o => o.id === id)
      if (!order) return state

      const billQty = parseInt(formData.billQty, 10) || 0
      const currentQty = order.Qty || 0
      const remainingQty = currentQty - billQty

      // Create a Gate Pass Pending record for this billing batch
      const batchId = `${id}-B${now.replace(/\D/g, '').slice(-8)}`
      const batchOrder = {
        ...order,
        id: batchId,
        parentId: id,
        Qty: billQty,
        BillQty: billQty,
        Qty_Billed: billQty,
        PendingQty: 0,
        BillPkgs: parseInt(formData.packages, 10) || Math.ceil(billQty / 10),
        BillNo: formData.billNo || `BILL-${batchId.slice(-6)}`,
        status: 'GATE_PASS_PENDING',
        previousStatus: 'BILLING_PENDING',
        billingData: formData,
        workflowHistory: [
          ...order.workflowHistory,
          {
            stage: 'BILLING_PENDING',
            label: 'Billing',
            approvedAt: now,
            approvedBy,
            processedQty: billQty,
            remainingQty,
            formData,
          },
        ],
      }

      if (remainingQty <= 0) {
        // All qty processed — mark original as fully processed
        const fullyProcessed = {
          ...order,
          Qty: 0,
          PendingQty: 0,
          status: 'BILLING_FULLY_PROCESSED',
          previousStatus: 'BILLING_PENDING',
          workflowHistory: [
            ...order.workflowHistory,
            {
              stage: 'BILLING_PENDING',
              label: 'Billing (Fully Processed)',
              approvedAt: now,
              approvedBy,
              processedQty: billQty,
              remainingQty: 0,
            },
          ],
        }
        return [...state.map(o => o.id === id ? fullyProcessed : o), batchOrder]
      } else {
        // Partial — reduce original qty, keep in BILLING_PENDING
        const updatedOriginal = {
          ...order,
          Qty: remainingQty,
          PendingQty: remainingQty,
          workflowHistory: [
            ...order.workflowHistory,
            {
              stage: 'BILLING_PARTIAL',
              label: 'Billing (Partial Processed)',
              approvedAt: now,
              approvedBy,
              processedQty: billQty,
              remainingQty,
            },
          ],
        }
        return [...state.map(o => o.id === id ? updatedOriginal : o), batchOrder]
      }
    }

    case 'CREATE_ORDER': {
      const { orderData } = action.payload
      const now = new Date().toISOString()
      const newOrder = {
        ...orderData,
        status: 'READY_FOR_DELIVERY_PENDING',
        previousStatus: null,
        workflowHistory: [],
        createdAt: now,
        updatedAt: now,
      }
      return [...state, newOrder]
    }

    case 'SUBMIT_GATE_PASS': {
      const { id, formData, approvedBy = 'Admin User' } = action.payload
      const now = new Date().toISOString()
      return state.map(o => {
        if (o.id !== id) return o
        return {
          ...o,
          status: 'AUDIT_PENDING',
          previousStatus: 'GATE_PASS_PENDING',
          GatePassDate: formData.gatePassDate || o.GatePassDate,
          DespatchThrough: formData.dispatchThrough || o.DespatchThrough,
          Godown: formData.godown || o.Godown,
          AccountName: formData.accountName || o.AccountName,
          gatePassData: formData,
          workflowHistory: [
            ...o.workflowHistory,
            {
              stage: 'GATE_PASS_PENDING',
              label: 'Gate Pass Out',
              approvedAt: now,
              approvedBy,
              formData,
            },
          ],
        }
      })
    }

    case 'APPROVE_AUDIT': {
      const { id, approvedBy = 'Admin User', auditPassed } = action.payload
      const now = new Date().toISOString()
      return state.map(o => {
        if (o.id !== id) return o
        return {
          ...o,
          status: 'FEEDBACK_PENDING',
          previousStatus: 'AUDIT_PENDING',
          auditPassed,
          workflowHistory: [
            ...o.workflowHistory,
            { stage: 'AUDIT_PENDING', label: 'Audit', approvedAt: now, approvedBy, auditPassed },
          ],
        }
      })
    }

    case 'SUBMIT_FEEDBACK': {
      const { id, feedbackText, approvedBy = 'Admin User' } = action.payload
      const now = new Date().toISOString()
      return state.map(o => {
        if (o.id !== id) return o
        return {
          ...o,
          status: 'COMPLETED',
          previousStatus: 'FEEDBACK_PENDING',
          feedbackText,
          workflowHistory: [
            ...o.workflowHistory,
            { stage: 'FEEDBACK_PENDING', label: 'Feedback', approvedAt: now, approvedBy, feedbackText },
          ],
        }
      })
    }

    default:
      return state
  }
}

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const [orders, dispatch] = useReducer(reducer, initialOrders)

  const approveOrder = (id, approvedBy = 'Admin User') =>
    dispatch({ type: 'APPROVE', payload: { id, approvedBy } })

  const submitRFD = (id, formData) =>
    dispatch({ type: 'SUBMIT_RFD', payload: { id, formData } })

  const submitBilling = (id, formData) =>
    dispatch({ type: 'SUBMIT_BILLING', payload: { id, formData } })

  const submitGatePass = (id, formData) =>
    dispatch({ type: 'SUBMIT_GATE_PASS', payload: { id, formData } })

  const approveAudit = (id, auditPassed) =>
    dispatch({ type: 'APPROVE_AUDIT', payload: { id, auditPassed } })

  const submitFeedback = (id, feedbackText) =>
    dispatch({ type: 'SUBMIT_FEEDBACK', payload: { id, feedbackText } })

  const createOrder = orderData =>
    dispatch({ type: 'CREATE_ORDER', payload: { orderData } })

  const getPendingByStage = stage =>
    orders.filter(o => o.status === stage)

  const getHistoryByStage = stage => {
    const level = STATUS_LEVEL[stage]
    return orders.filter(o => STATUS_LEVEL[o.status] > level)
  }

  const stats = {
    total: orders.filter(o => !o.parentId).length,
    orderDetailsPending: orders.filter(o => o.status === 'ORDER_DETAILS_PENDING').length,
    readyForDeliveryPending: orders.filter(o => o.status === 'READY_FOR_DELIVERY_PENDING').length,
    billingPending: orders.filter(o => o.status === 'BILLING_PENDING').length,
    gatePassPending: orders.filter(o => o.status === 'GATE_PASS_PENDING').length,
    auditPending: orders.filter(o => o.status === 'AUDIT_PENDING').length,
    feedbackPending: orders.filter(o => o.status === 'FEEDBACK_PENDING').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
  }

  const recentActivity = [...orders]
    .flatMap(o =>
      o.workflowHistory.map(h => ({
        ...h,
        orderId: o.id,
        orderNo: o.OrderNo,
        product: o.ProductName,
        company: o.CompanyName,
      }))
    )
    .sort((a, b) => new Date(b.approvedAt) - new Date(a.approvedAt))
    .slice(0, 12)

  return (
    <OrderContext.Provider value={{
      orders, approveOrder, submitRFD, submitBilling, submitGatePass, 
      approveAudit, submitFeedback, createOrder,
      getPendingByStage, getHistoryByStage, stats, recentActivity,
    }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrderContext() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrderContext must be used within OrderProvider')
  return ctx
}
