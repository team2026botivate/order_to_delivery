import { useState, useMemo } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Plus, Edit2, Trash2, Key, Check, X } from 'lucide-react';

export default function UserManagement() {
  const { usersList, setUsersList } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordReset, setShowPasswordReset] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [form, setForm] = useState({
    name: '', username: '', email: '', password: '', confirmPassword: '', role: 'USER', status: 'Active'
  });
  const [errors, setErrors] = useState({});

  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter && u.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return u.name.toLowerCase().includes(s) || u.username.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
      }
      return true;
    });
  }, [usersList, search, roleFilter, statusFilter]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.username.trim()) e.username = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!editingUser) {
      if (!form.password) e.password = 'Required';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    
    // Uniqueness
    const others = usersList.filter(u => !editingUser || u.id !== editingUser.id);
    if (others.some(u => u.username === form.username)) e.username = 'Username taken';
    if (others.some(u => u.email === form.email)) e.email = 'Email taken';
    
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    
    if (editingUser) {
      const updated = usersList.map(u => u.id === editingUser.id ? { ...u, ...form, password: u.password } : u);
      setUsersList(updated);
    } else {
      const newUser = {
        id: `usr-${Date.now()}`,
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
        status: form.status,
        permissions: { dashboard: true, orderDetails: true, readyForDelivery: false, billing: false, gatePassOut: false, settings: false }
      };
      setUsersList([...usersList, newUser]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsersList(usersList.filter(u => u.id !== id));
    }
  };

  const handleToggleStatus = (user) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    setUsersList(usersList.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
  };

  const resetPassword = (id, newPassword) => {
    setUsersList(usersList.map(u => u.id === id ? { ...u, password: newPassword } : u));
    setShowPasswordReset(null);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({ name: u.name, username: u.username, email: u.email, role: u.role, status: u.status, password: '', confirmPassword: '' });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setForm({ name: '', username: '', email: '', password: '', confirmPassword: '', role: 'USER', status: 'Active' });
    setErrors({});
  };

  return (
    <div className="um-container">
      <div className="um-toolbar">
        <div className="um-filters">
          <input type="text" className="form-input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-select form-input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
          <select className="form-select form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14}/> Add User</button>
      </div>

      <div className="table-wrapper" style={{ marginTop: 16 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td><span className={`role-badge ${u.role.toLowerCase()}`}>{u.role}</span></td>
                <td>
                  <span className={`status-badge ${u.status === 'Active' ? 'active' : 'inactive'}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" onClick={() => openEdit(u)} title="Edit"><Edit2 size={14}/></button>
                    <button className="btn-icon" onClick={() => setShowPasswordReset(u.id)} title="Reset Password"><Key size={14}/></button>
                    <button className="btn-icon" onClick={() => handleToggleStatus(u)} title={u.status === 'Active' ? 'Deactivate' : 'Activate'}>
                      {u.status === 'Active' ? <X size={14}/> : <Check size={14}/>}
                    </button>
                    <button className="btn-icon text-danger" onClick={() => handleDelete(u.id)} title="Delete"><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="form-modal-backdrop" onClick={closeModal}>
          <div className="form-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="form-modal-header">
              <div className="form-modal-title">{editingUser ? 'Edit User' : 'Add User'}</div>
              <button className="form-modal-close" onClick={closeModal}><X size={14}/></button>
            </div>
            <div className="form-modal-body">
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input type="text" className="form-input" value={form.name} onChange={e => {setForm({...form, name: e.target.value}); setErrors({...errors, name: ''})}} />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input type="text" className="form-input" value={form.username} onChange={e => {setForm({...form, username: e.target.value}); setErrors({...errors, username: ''})}} />
                  {errors.username && <span className="form-error">{errors.username}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" value={form.email} onChange={e => {setForm({...form, email: e.target.value}); setErrors({...errors, email: ''})}} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              
              {!editingUser && (
                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input type="password" className="form-input" value={form.password} onChange={e => {setForm({...form, password: e.target.value}); setErrors({...errors, password: ''})}} />
                    {errors.password && <span className="form-error">{errors.password}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password *</label>
                    <input type="password" className="form-input" value={form.confirmPassword} onChange={e => {setForm({...form, confirmPassword: e.target.value}); setErrors({...errors, confirmPassword: ''})}} />
                    {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                  </div>
                </div>
              )}

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select form-input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="form-modal-footer">
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showPasswordReset && (
        <PasswordResetModal 
          onClose={() => setShowPasswordReset(null)} 
          onSave={(pwd) => resetPassword(showPasswordReset, pwd)} 
        />
      )}
    </div>
  );
}

function PasswordResetModal({ onClose, onSave }) {
  const [pwd, setPwd] = useState('');
  const [cPwd, setCPwd] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    if (!pwd) { setErr('Required'); return; }
    if (pwd !== cPwd) { setErr('Passwords do not match'); return; }
    onSave(pwd);
  };

  return (
    <div className="form-modal-backdrop" onClick={onClose}>
      <div className="form-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="form-modal-header">
          <div className="form-modal-title">Reset Password</div>
          <button className="form-modal-close" onClick={onClose}><X size={14}/></button>
        </div>
        <div className="form-modal-body">
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" value={pwd} onChange={e => setPwd(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-input" value={cPwd} onChange={e => setCPwd(e.target.value)} />
            {err && <span className="form-error">{err}</span>}
          </div>
        </div>
        <div className="form-modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={submit}>Reset</button>
        </div>
      </div>
    </div>
  );
}
