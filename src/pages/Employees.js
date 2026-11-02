import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiDownload, FiFilter, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { deleteEmployee } from '../features/employees/employeesSlice';

export default function Employees() {
  const employees = useSelector((state) => state.employees.items);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const normalizedQuery = query.trim().toLowerCase();
  const searchableText = (employee) => [
    employee.name, employee.email, employee.phone, employee.role, employee.department,
    employee.status, employee.startDate,
  ].filter(Boolean).join(' ').toLowerCase();
  const filtered = employees
    .filter((employee) => !normalizedQuery || searchableText(employee).includes(normalizedQuery))
    .sort((first, second) => {
      if (!normalizedQuery) return first.name.localeCompare(second.name);
      const firstName = first.name.toLowerCase();
      const secondName = second.name.toLowerCase();
      const firstExact = firstName.startsWith(normalizedQuery) ? 0 : 1;
      const secondExact = secondName.startsWith(normalizedQuery) ? 0 : 1;
      return firstExact - secondExact || first.name.localeCompare(second.name);
    });

  const updateQuery = (event) => {
    const value = event.target.value;
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) nextParams.set('q', value);
    else nextParams.delete('q');
    setSearchParams(nextParams);
  };
  const joiningEmployees = employees.filter((employee) =>
    employee.status === 'Completed' || employee.status === 'Verified & Onboarding Complete'
  );
  const rejectedEmployees = employees.filter((employee) =>
    employee.status === 'Rejected - Correction Required' || employee.status === 'Rejected'
  );

  const exportEmployees = (employeeList, fileName, sheetName) => {
    if (!employeeList.length) return;

    const rows = employeeList.map((employee) => {
      const isRejected = employee.status.startsWith('Rejected');
      return {
        'Employee ID': `EMP-${String(employee.id).padStart(4, '0')}`,
        Name: employee.name,
        Email: employee.email,
        Phone: employee.phone || '',
        Role: employee.role,
        Department: employee.department,
        'Joining Date': employee.startDate || '',
        Status: employee.status,
        ...(isRejected
          ? {
              'Rejection Reason': employee.rejectionRemark || '',
              'Rejected At': employee.rejectedAt || '',
              'Rejected By': employee.rejectedBy || '',
            }
          : {
              'Approved At': employee.approvedAt || '',
              'Approved By': employee.approvedBy || '',
            }),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    worksheet['!cols'] = Object.keys(rows[0]).map((key) => ({
      wch: Math.max(key.length + 2, ...rows.map((row) => String(row[key] || '').length + 2)),
    }));
    XLSX.writeFile(workbook, fileName);
  };

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
          <div className="table-search"><FiSearch /><input value={query} onChange={updateQuery} placeholder="Search name, email, role, department or status" /></div>
          <div className="employee-export-actions">
            <button
              type="button"
              className="secondary-button"
              disabled={!joiningEmployees.length}
              onClick={() => exportEmployees(joiningEmployees, 'Joining-Employees.xlsx', 'Joining Employees')}
            >
              <FiDownload /> Joining Excel ({joiningEmployees.length})
            </button>
            <button
              type="button"
              className="secondary-button"
              disabled={!rejectedEmployees.length}
              onClick={() => exportEmployees(rejectedEmployees, 'Rejected-Employees.xlsx', 'Rejected Employees')}
            >
              <FiDownload /> Rejected Excel ({rejectedEmployees.length})
            </button>
            <button className="secondary-button"><FiFilter /> Filter</button>
          </div>
        </div>
        <div className="table-responsive">
          <table>
            <thead><tr><th>Employee</th><th>Role</th><th>Department</th><th>Joining date</th><th>Status</th><th /></tr></thead>
            <tbody>
              {filtered.map((employee) => (
                <tr key={employee.id}>
                  <td><div className="employee-cell">
                    {employee.profilePhoto
                      ? <img src={employee.profilePhoto} alt="" />
                      : <span>{employee.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</span>}
                    <div><strong>{employee.name}</strong><small>{employee.email}</small></div>
                  </div></td>
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
