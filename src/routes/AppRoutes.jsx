import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '../pages/Dashboard/Dashboard'
import OrderDetails from '../pages/OrderDetails/OrderDetails'
import ReadyForDelivery from '../pages/ReadyForDelivery/ReadyForDelivery'
import Billing from '../pages/Billing/Billing'
import GatePassOut from '../pages/GatePassOut/GatePassOut'
import Audit from '../pages/Audit/Audit'
import Feedback from '../pages/Feedback/Feedback'
import Login from '../pages/Login/Login'
import Unauthorized from '../pages/Unauthorized/Unauthorized'
import Settings from '../pages/Settings/Settings'
import ProtectedRoute from '../auth/ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute permissionKey="dashboard"><Dashboard /></ProtectedRoute>
      } />
      <Route path="/order-details" element={
        <ProtectedRoute permissionKey="orderDetails"><OrderDetails /></ProtectedRoute>
      } />
      <Route path="/ready-for-delivery" element={
        <ProtectedRoute permissionKey="readyForDelivery"><ReadyForDelivery /></ProtectedRoute>
      } />
      <Route path="/billing" element={
        <ProtectedRoute permissionKey="billing"><Billing /></ProtectedRoute>
      } />
      <Route path="/gate-pass-out" element={
        <ProtectedRoute permissionKey="gatePassOut"><GatePassOut /></ProtectedRoute>
      } />
      <Route path="/audit" element={
        <ProtectedRoute permissionKey="audit"><Audit /></ProtectedRoute>
      } />
      <Route path="/feedback" element={
        <ProtectedRoute permissionKey="feedback"><Feedback /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute permissionKey="settings"><Settings /></ProtectedRoute>
      } />
    </Routes>
  )
}
