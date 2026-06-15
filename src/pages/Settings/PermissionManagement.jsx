import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';

export default function PermissionManagement() {
  const { usersList, setUsersList } = useAuth();
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState(null);

  const pages = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'orderDetails', label: 'Order Details' },
    { key: 'readyForDelivery', label: 'Ready For Delivery' },
    { key: 'billing', label: 'Billing' },
    { key: 'gatePassOut', label: 'Gate Pass Out' },
    { key: 'audit', label: 'Audit' },
    { key: 'feedback', label: 'Feedback' },
  ];

  const handleSelectUser = (e) => {
    const userId = e.target.value;
    if (!userId) {
      setSelectedUser(null);
      setPermissions(null);
      return;
    }
    const user = usersList.find(u => u.id === userId);
    setSelectedUser(user);
    setPermissions({ ...user.permissions });
  };

  const handleToggle = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    if (!selectedUser) return;
    const updatedUsers = usersList.map(u => 
      u.id === selectedUser.id ? { ...u, permissions: { ...permissions } } : u
    );
    setUsersList(updatedUsers);
    alert('Permissions saved successfully!');
  };

  return (
    <div className="pm-container">
      <div className="pm-card">
        <h3 className="pm-title">Manage Page Access</h3>
        <p className="pm-desc">Select a user to modify their page-level permissions. Admins have full access implicitly.</p>
        
        <div className="form-group" style={{ maxWidth: 300, marginBottom: 24 }}>
          <label className="form-label">Select User</label>
          <select className="form-select form-input" value={selectedUser?.id || ''} onChange={handleSelectUser}>
            <option value="">-- Choose User --</option>
            {usersList.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {selectedUser && (
          <div className="pm-permissions">
            {selectedUser.role === 'ADMIN' && (
              <div className="pm-notice">
                <strong>Note:</strong> This user is an ADMIN. They have access to all pages regardless of these settings.
              </div>
            )}
            
            <div className="pm-list">
              {pages.map(page => (
                <label key={page.key} className="pm-item">
                  <input 
                    type="checkbox" 
                    checked={!!permissions[page.key]} 
                    onChange={() => handleToggle(page.key)}
                  />
                  <span>{page.label}</span>
                </label>
              ))}
              <label className="pm-item pm-item-disabled">
                <input type="checkbox" checked={false} disabled />
                <span style={{ color: 'var(--text-muted)' }}>Settings (Hidden for Users)</span>
              </label>
            </div>

            <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 24 }}>
              Save Permissions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
