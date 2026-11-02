import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiCalendar, FiCheck, FiMail, FiMapPin, FiPhone, FiSend, FiTrash2, FiXCircle } from 'react-icons/fi';
import { approveEmployee, deleteEmployee, rejectEmployee } from '../features/employees/employeesSlice';

export default function Profile() {
  const { id } = useParams();
  const employees = useSelector((state) => state.employees.items);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [showReject, setShowReject] = useState(false);
  const [remark, setRemark] = useState('');
  const employee = employees.find((item) => String(item.id) === id)
    || (user.type === 'employee' && employees.find((item) => item.loginEmail === user.email || item.email === user.email))
    || (user.type !== 'employee' ? employees[0] : undefined);

  if (!employee) {
    return (
      <div className="panel empty-state">
        <h1>Employee record not found</h1>
        <p>This employee may have been deleted.</p>
      </div>
    );
  }

  const documents = JSON.parse(localStorage.getItem('employeeDocuments') || '[]');
  const requiredDocumentKeys = ['aadhaar', 'pan', 'experience'];
  const allDocumentsVerified = requiredDocumentKeys.every((key) => documents.some((document) => document.documentKey === key && document.complete));
  const isHR = user.type !== 'employee';
  const employeeNotifications = JSON.parse(localStorage.getItem('employeeEmailNotifications') || '[]');
  const completionEmail = employeeNotifications.find((notification) =>
    notification.type !== 'rejected'
    && (notification.to === employee.email || notification.to === user.email)
  );

  const approveProfile = () => {
    if (!allDocumentsVerified) return;
    dispatch(approveEmployee({ id: employee.id, approvedBy: user.name }));
    const notifications = JSON.parse(localStorage.getItem('employeeEmailNotifications') || '[]');
    notifications.unshift({
      to: employee.email,
      subject: 'Verification complete - Onboarding process completed',
      message: `Dear ${employee.name}, your profile and documents have been verified. Your onboarding process is now complete.`,
      sentAt: new Date().toISOString(),
      sentBy: user.name,
    });
    localStorage.setItem('employeeEmailNotifications', JSON.stringify(notifications));
  };

  const rejectProfile = () => {
    if (!remark.trim()) return;
    dispatch(rejectEmployee({ id: employee.id, remark: remark.trim(), rejectedBy: user.name }));
    const notifications = JSON.parse(localStorage.getItem('employeeEmailNotifications') || '[]');
    notifications.unshift({
      to: employee.email,
      subject: 'Action required - Profile returned by HR',
      message: `Dear ${employee.name}, your profile was returned for correction. HR remark: ${remark.trim()} Please edit and resubmit your onboarding profile.`,
      sentAt: new Date().toISOString(),
      sentBy: user.name,
      type: 'rejected',
    });
    localStorage.setItem('employeeEmailNotifications', JSON.stringify(notifications));
    setShowReject(false);
  };

  const deleteProfile = () => {
    if (window.confirm(`Delete ${employee.name}?`)) dispatch(deleteEmployee(employee.id));
  };

  return (
    <>
      <div className="page-heading"><div><span>EMPLOYEE DETAILS</span><h1>Employee profile</h1><p>Personal and professional information.</p></div></div>
      {!isHR && employee.status === 'Verified & Onboarding Complete' && (
        <div className="onboarding-complete-banner">
          <div className="completion-check"><FiCheck /></div>
          <div><span>ONBOARDING COMPLETED</span><h2>Your onboarding process is complete</h2><p>HR has verified your profile and required documents.</p></div>
          <small>Verified</small>
        </div>
      )}
      {completionEmail && (
        <div className="completion-email">
          <FiMail />
          <div><strong>{completionEmail.subject}</strong><p>{completionEmail.message}</p></div>
          <small>Verification email delivered</small>
        </div>
      )}
      {user.type === 'employee' && employee.rejectionRemark && (
        <div className="rejection-notice">
          <FiXCircle />
          <div><strong>Profile correction required</strong><p>{employee.rejectionRemark}</p></div>
          <Link to="/onboarding" className="secondary-button">Edit and resubmit</Link>
        </div>
      )}
      <div className="profile-layout">
        <aside className="panel profile-card">
          {employee.profilePhoto
            ? <img className="profile-avatar profile-avatar-image" src={employee.profilePhoto} alt={`${employee.name} profile`} />
            : <div className="profile-avatar">{employee.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div>}
          <h2>{employee.name}</h2><p>{employee.role}</p>
          <span className={`status ${employee.status.toLowerCase().replace(' ', '-')}`}>{employee.status}</span>
          <div className="profile-meta"><span><FiMail /> {employee.email}</span><span><FiPhone /> {employee.phone}</span><span><FiMapPin /> Bengaluru, India</span></div>
        </aside>
        <section className="panel details-card">
          <h2>Professional information</h2>
          <div className="detail-grid">
            <div><span>Employee ID</span><strong>EMP-{String(employee.id).padStart(4, '0')}</strong></div>
            <div><span><FiBriefcase /> Department</span><strong>{employee.department}</strong></div>
            <div><span>Designation</span><strong>{employee.role}</strong></div>
            <div><span><FiCalendar /> Joining date</span><strong>{employee.startDate}</strong></div>
            <div><span>Employment type</span><strong>Full time</strong></div>
            <div><span>Reporting manager</span><strong>Sarah Johnson</strong></div>
          </div>
          <h2 className="details-subheading">Onboarding checklist</h2>
          <div className="checklist">
            <label><input type="checkbox" defaultChecked /> Personal details</label>
            <label><input type="checkbox" defaultChecked /> Professional details</label>
            <label><input type="checkbox" checked={!isHR && employee.status === 'Verified & Onboarding Complete'} readOnly /> Document submission</label>
            <label><input type="checkbox" checked={!isHR && employee.status === 'Verified & Onboarding Complete'} readOnly /> IT equipment setup</label>
          </div>
          {isHR && (
            <div className="hr-approval-box">
              <div><strong>HR profile approval</strong><p>{allDocumentsVerified ? 'All documents are verified.' : `${documents.filter((document) => document.complete).length}/${documents.length || 0} documents verified.`}</p></div>
              {!documents.length && <small className="approval-warning">Upload and verify the required documents before approving.</small>}
              <button className="primary-button" disabled={!allDocumentsVerified || employee.status === 'Verified & Onboarding Complete'} onClick={approveProfile}><FiSend /> {employee.status === 'Verified & Onboarding Complete' ? 'Approved' : 'Approve profile & send email'}</button>
              <button className="reject-button" disabled={employee.status === 'Verified & Onboarding Complete'} onClick={() => setShowReject(true)}><FiXCircle /> Reject</button>
              <button className="delete-button" onClick={deleteProfile}><FiTrash2 /> Delete employee</button>
            </div>
          )}
          {showReject && (
            <div className="reject-panel">
              <label htmlFor="rejectRemark">Rejection remark / reason *</label>
              <textarea id="rejectRemark" value={remark} onChange={(event) => setRemark(event.target.value)} placeholder="Explain what the employee needs to correct..." />
              <div><button className="secondary-button" onClick={() => setShowReject(false)}>Cancel</button><button className="reject-button" disabled={!remark.trim()} onClick={rejectProfile}><FiSend /> Reject & send message</button></div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
