import { useState } from 'react';
import { Shield } from 'lucide-react';
import UserManagement from './UserManagement';
import PermissionManagement from './PermissionManagement';
import './Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Settings & Access Control</h1>
        </div>
      </div>

      <div className="settings-tabs">
        <button 
          className={`settings-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button 
          className={`settings-tab ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          Permission Management
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'permissions' && <PermissionManagement />}
      </div>
    </div>
  );
}
