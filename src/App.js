import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import {
  FiBell, FiBriefcase, FiChevronRight, FiFileText, FiGrid, FiLogOut,
  FiMenu, FiSearch, FiUserPlus, FiUsers, FiX,
} from 'react-icons/fi';
import { logout } from './features/auth/authSlice';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Documents from './pages/Documents';
import Login from './pages/Login';
import './App.css';

function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);

  const signOut = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    ...(user?.type === 'employee'
      ? [
          { to: '/onboarding', label: 'Complete onboarding', icon: FiUserPlus },
          { to: '/documents', label: 'Upload documents', icon: FiFileText },
          { to: '/profile', label: 'My profile', icon: FiBriefcase },
        ]
      : [
          { to: '/', label: 'Dashboard', icon: FiGrid },
          { to: '/employees', label: 'Employee submissions', icon: FiUsers },
          { to: '/documents', label: 'Documents', icon: FiFileText },
          { to: '/profile', label: 'My profile', icon: FiBriefcase },
        ]),
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><FiBriefcase /></div>
          <div><strong>Onboard</strong><span>HR PORTAL</span></div>
          <button className="sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><FiX /></button>
        </div>
        <nav className="side-nav">
          <p className="nav-heading">MAIN MENU</p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}>
              <Icon /> <span>{label}</span>
              <FiChevronRight className="nav-arrow" />
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{user?.name?.slice(0, 2).toUpperCase() || 'AD'}</div>
          <div><strong>{user?.name || 'Admin'}</strong><span>{user?.role || 'HR Manager'}</span></div>
          <button onClick={signOut} title="Sign out"><FiLogOut /></button>
        </div>
      </aside>

      {menuOpen && <button className="menu-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu"><FiMenu /></button>
          <div className="search-box"><FiSearch /><input placeholder="Search employees..." /></div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications"><FiBell /><span /></button>
            <div className="top-avatar">{user?.name?.slice(0, 1).toUpperCase() || 'A'}</div>
          </div>
        </header>
        <div className="page-content">
          <Routes>
            <Route path="/" element={user.type === 'employee' ? <Navigate to="/onboarding" replace /> : <Dashboard />} />
            <Route path="/employees" element={user.type === 'employee' ? <Navigate to="/onboarding" replace /> : <Employees />} />
            <Route path="/employees/:id" element={user.type === 'employee' ? <Navigate to="/profile" replace /> : <Profile />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  const user = useSelector((state) => state.auth.user);
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
