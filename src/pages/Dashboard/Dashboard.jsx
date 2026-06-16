import { useOrderContext } from '../../context/OrderContext'
import DeliveryAnalytics from '../../components/DeliveryAnalytics/DeliveryAnalytics'
import './Dashboard.css'

export default function Dashboard() {
  const { orders } = useOrderContext()

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <DeliveryAnalytics orders={orders} />
    </div>
  )
}
