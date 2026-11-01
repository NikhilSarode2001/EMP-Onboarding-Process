import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBriefcase, FiLock, FiMail } from 'react-icons/fi';
import { login, loginFailed } from '../features/auth/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const error = useSelector((state) => state.auth.error);

  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    if (!email || !password) {
      dispatch(loginFailed('Please enter your email and password.'));
      return;
    }
    const type = data.get('userType') || 'hr';
    dispatch(login({
      name: type === 'employee' ? 'New Employee' : 'HR Manager',
      email,
      role: type === 'employee' ? 'Employee' : 'HR Manager',
      type,
      permissions: type === 'hr'
        ? ['view-employees', 'review-onboarding', 'manage-documents']
        : ['complete-onboarding', 'upload-documents', 'view-profile'],
    }));
    navigate(location.state?.from?.pathname || '/', { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand"><span><FiBriefcase /></span><strong>Onboarding Process</strong></div>
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
            <label><input type="radio" name="userType" value="employee" /> Employee</label>
            <label><input type="radio" name="userType" value="hr" defaultChecked /> HR user</label>
          </div>
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
