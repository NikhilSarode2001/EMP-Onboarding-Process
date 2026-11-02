import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBriefcase, FiLock, FiMail } from 'react-icons/fi';
import { login, loginFailed } from '../features/auth/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const error = useSelector((state) => state.auth.error);
  const [accountType, setAccountType] = useState('employee');
  const [companyRole, setCompanyRole] = useState('hr');

  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    if (!email || !password) {
      dispatch(loginFailed('Please enter your email and password.'));
      return;
    }
    const type = accountType === 'employee' ? 'employee' : companyRole;
    const displayRole = type === 'admin' ? 'Admin Login' : type === 'hr' ? 'HR Login' : 'Employee';
    const roleConfig = {
      hr: { name: 'HR Manager', role: 'HR Manager', permissions: ['view-employees', 'review-onboarding', 'manage-documents'] },
      admin: { name: 'System Admin', role: 'Administrator', permissions: ['manage-users', 'view-employees', 'review-onboarding', 'manage-documents', 'manage-settings'] },
      employee: { name: 'New Employee', role: 'Employee', permissions: ['complete-onboarding', 'upload-documents', 'view-profile'] },
    }[type];
    dispatch(login({
      name: companyRole.name,
      email,
      role: displayRole,
      type,
      permissions: roleConfig.permissions,
    }));
    navigate(location.state?.from?.pathname || '/', { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand"><span><FiBriefcase /></span><strong>Emp Onboarding Process</strong></div>
        <h1>Welcome back</h1>
        <p>Sign in to manage your employee onboarding workspace.</p>
        <form onSubmit={submit}>
          {error && <div className="form-alert">{error}</div>}
          <label>Email address</label>
          <div className="input-icon"><FiMail /><input name="email" type="email" placeholder="admin@company.com" /></div>
          <label>Password</label>
          <div className="input-icon"><FiLock /><input name="password" type="password" placeholder="Enter your password" /></div>
          <label>Sign in as</label>
          <div className="role-options">
            <label><input type="radio" name="accountType" value="employee" checked={accountType === 'employee'} onChange={() => setAccountType('employee')} /> Employee</label>
            <label><input type="radio" name="accountType" value="company" checked={accountType === 'company'} onChange={() => setAccountType('company')} /> Company users</label>
          </div>
          {accountType === 'company' && (
            <>
              <label>Company login</label>
              <div className="role-options">
                <label><input type="radio" name="companyRole" value="hr" checked={companyRole === 'hr'} onChange={() => setCompanyRole('hr')} /> HR Login</label>
                <label><input type="radio" name="companyRole" value="admin" checked={companyRole === 'admin'} onChange={() => setCompanyRole('admin')} /> Admin Login</label>
              </div>
            </>
          )}
          <button className="primary-button login-button" type="submit">Sign in</button>
        </form>
        <small>Demo portal: use any valid email and password.</small>
      </div>
      <div className="login-showcase">
        <div><span>EMPLOYEE EXPERIENCE</span><h2>Great beginnings create great teams.</h2><p>Manage every step of your employee journey in one place.</p></div>
      </div>
    </div>
  );
}
