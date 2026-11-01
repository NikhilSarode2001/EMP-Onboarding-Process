import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiClock, FiUserPlus, FiUsers } from 'react-icons/fi';

export default function Dashboard() {
  const employees = useSelector((state) => state.employees.items);
  const completed = employees.filter((employee) => employee.status === 'Completed').length;
  const pending = employees.filter((employee) => employee.status === 'Pending').length;
  const cards = [
    { label: 'Total employees', value: employees.length, icon: FiUsers, color: 'blue', note: '+2 this month' },
    { label: 'In progress', value: employees.length - completed - pending, icon: FiClock, color: 'orange', note: 'Active onboarding' },
    { label: 'Completed', value: completed, icon: FiCheckCircle, color: 'green', note: `${completed * 25}% completion` },
    { label: 'Pending', value: pending, icon: FiUserPlus, color: 'purple', note: 'Awaiting action' },
  ];

  return (
    <>
      <div className="page-heading">
        <div><span>OVERVIEW</span><h1>Good morning, Admin</h1><p>Here is what is happening with your onboarding team.</p></div>
        <Link to="/onboarding" className="primary-button"><FiUserPlus /> Add employee</Link>
      </div>
      <section className="stat-grid">
        {cards.map(({ label, value, icon: Icon, color, note }) => (
          <article className="stat-card" key={label}>
            <div className={`stat-icon ${color}`}><Icon /></div>
            <div><p>{label}</p><h2>{value}</h2><small>{note}</small></div>
          </article>
        ))}
      </section>
      <section className="dashboard-grid">
        <article className="panel recent-panel">
          <div className="panel-heading"><div><h2>Recent onboarding</h2><p>Latest employee onboarding activity</p></div><Link to="/employees">View all <FiArrowRight /></Link></div>
          <div className="table-responsive">
            <table>
              <thead><tr><th>Employee</th><th>Department</th><th>Start date</th><th>Status</th></tr></thead>
              <tbody>
                {employees.slice(0, 4).map((employee) => (
                  <tr key={employee.id}>
                    <td><div className="employee-cell"><span>{employee.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</span><div><strong>{employee.name}</strong><small>{employee.email}</small></div></div></td>
                    <td>{employee.department}</td><td>{employee.startDate}</td>
                    <td><span className={`status ${employee.status.toLowerCase().replace(' ', '-')}`}>{employee.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <article className="panel progress-panel">
          <h2>Onboarding progress</h2><p>Overall employee completion</p>
          <div className="progress-ring"><div><strong>75%</strong><span>Completed</span></div></div>
          <div className="progress-labels"><span><i className="green-dot" /> Completed <b>{completed}</b></span><span><i className="orange-dot" /> In progress <b>{employees.length - completed - pending}</b></span></div>
        </article>
      </section>
    </>
  );
}
