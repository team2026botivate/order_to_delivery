import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEFAULT_ADMIN = {
  id: 'admin-1',
  name: 'Admin User',
  username: 'admin',
  email: 'admin@acemark.com',
  password: 'admin', // in a real app, hash this
  role: 'ADMIN',
  status: 'Active',
  permissions: {
    dashboard: true,
    orderDetails: true,
    readyForDelivery: true,
    billing: true,
    gatePassOut: true,
    audit: true,
    feedback: true,
    settings: true,
    onTimeDelivery: true,
  },
};

export const DEFAULT_USER = {
  id: 'user-1',
  name: 'Standard User',
  username: 'user',
  email: 'user@acemark.com',
  password: 'user', // in a real app, hash this
  role: 'USER',
  status: 'Active',
  permissions: {
    dashboard: true,
    orderDetails: true,
    readyForDelivery: false,
    billing: false,
    gatePassOut: false,
    audit: true,
    feedback: true,
    settings: false,
    onTimeDelivery: true,
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize users and session
  useEffect(() => {
    // 1. Load users list
    const storedUsers = localStorage.getItem('acemark_users');
    let loadedUsers = [];
    if (storedUsers) {
      loadedUsers = JSON.parse(storedUsers);
      // Ensure DEFAULT_USER is there if not found
      if (!loadedUsers.find(u => u.username === 'user')) {
         loadedUsers.push(DEFAULT_USER);
         localStorage.setItem('acemark_users', JSON.stringify(loadedUsers));
      }
      // Inject new permissions for existing users if missing
      loadedUsers = loadedUsers.map(u => ({
        ...u,
        permissions: {
          ...u.permissions,
          audit: u.permissions.audit !== undefined ? u.permissions.audit : (u.role === 'ADMIN' || u.username === 'user'),
          feedback: u.permissions.feedback !== undefined ? u.permissions.feedback : (u.role === 'ADMIN' || u.username === 'user'),
          onTimeDelivery: u.permissions.onTimeDelivery !== undefined ? u.permissions.onTimeDelivery : true,
        }
      }));
      localStorage.setItem('acemark_users', JSON.stringify(loadedUsers));
    } else {
      loadedUsers = [DEFAULT_ADMIN, DEFAULT_USER];
      localStorage.setItem('acemark_users', JSON.stringify(loadedUsers));
    }
    setUsersList(loadedUsers);

    // 2. Load active session
    const storedSession = localStorage.getItem('acemark_session');
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      // Validate session against current users list
      const validUser = loadedUsers.find(u => u.id === parsedSession.id && u.status === 'Active');
      if (validUser) {
        setUser(validUser);
      } else {
        localStorage.removeItem('acemark_session');
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const foundUser = usersList.find(
      (u) => (u.username === username || u.email === username) && u.password === password
    );

    if (foundUser) {
      if (foundUser.status !== 'Active') {
        throw new Error('Account is inactive.');
      }
      setUser(foundUser);
      localStorage.setItem('acemark_session', JSON.stringify(foundUser));
      return true;
    }
    throw new Error('Invalid username or password.');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('acemark_session');
  };

  // Sync users list to local storage whenever it updates
  useEffect(() => {
    if (!loading && usersList.length > 0) {
      localStorage.setItem('acemark_users', JSON.stringify(usersList));
      // Update current user if their permissions/details changed
      if (user) {
        const updatedMe = usersList.find(u => u.id === user.id);
        if (updatedMe && JSON.stringify(updatedMe) !== JSON.stringify(user)) {
          if (updatedMe.status !== 'Active') {
            logout();
          } else {
            setUser(updatedMe);
            localStorage.setItem('acemark_session', JSON.stringify(updatedMe));
          }
        }
      }
    }
  }, [usersList, loading, user]);

  return (
    <AuthContext.Provider value={{ user, usersList, setUsersList, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
