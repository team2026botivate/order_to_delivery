import { useNavigate } from 'react-router-dom';
import './Unauthorized.css';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <h1 className="unauthorized-title">403</h1>
        <h2 className="unauthorized-subtitle">Access Denied</h2>
        <p className="unauthorized-text">
          You do not have permission to access this page.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
