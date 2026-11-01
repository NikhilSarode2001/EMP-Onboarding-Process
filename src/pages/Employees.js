import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiFilter, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import { deleteEmployee } from '../features/employees/employeesSlice';

export default function Employees() {
  const employees = useSelector((state) => state.employees.items);
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const filtered = employees.filter((employee) => `${employee.name} ${employee.role} ${employee.department}`.toLowerCase().includes(query.toLowerCase()));

  const removeEmployee = (employee) => {
    if (window.confirm(`Delete ${employee.name}? This employee and their onboarding record will be removed.`)) {
      dispatch(deleteEmployee(employee.id));
    }
  };

  return (
    <>
      <div className="page-heading"><div><span>TEAM DIRECTORY</span><h1>Employees</h1><p>Manage employee profiles and onboarding status.</p></div><Link to="/onboarding" className="primary-button"><FiPlus /> Add employee</Link></div>
      <article className="panel list-panel">
        <div className="list-toolbar">
          <div className="table-search"><FiSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, role or department" /></div>
          <button className="secondary-button"><FiFilter /> Filter</button>
        </div>
        <div className="table-responsive">
          <table>
            <thead><tr><th>Employee</th><th>Role</th><th>Department</th><th>Joining date</th><th>Status</th><th /></tr></thead>
            <tbody>
              {filtered.map((employee) => (
                <tr key={employee.id}>
                  <td><div className="employee-cell"><span>{employee.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</span><div><strong>{employee.name}</strong><small>{employee.email}</small></div></div></td>
                  <td>{employee.role}</td><td>{employee.department}</td><td>{employee.startDate}</td>
                  <td><span className={`status ${employee.status.toLowerCase().replace(' ', '-')}`}>{employee.status}</span></td>
                  <td>
                    <div className="employee-row-actions">
                      <Link className="row-action" to={`/employees/${employee.id}`} aria-label={`Review ${employee.name}`}><FiChevronRight /></Link>
                      <button type="button" className="delete-row-button" onClick={() => removeEmployee(employee)} aria-label={`Delete ${employee.name}`}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>Showing {filtered.length} of {employees.length} employees</span><div><button><FiChevronLeft /></button><button className="active">1</button><button><FiChevronRight /></button></div></div>
      </article>
    </>
  );
}
