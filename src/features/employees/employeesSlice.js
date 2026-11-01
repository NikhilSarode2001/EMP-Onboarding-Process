import { createSlice } from '@reduxjs/toolkit';

const initialEmployees = [
  { id: 1, name: 'Aarav Sharma', email: 'aarav@company.com', role: 'Frontend Developer', department: 'Engineering', status: 'In Progress', startDate: '2026-11-12', phone: '+91 98765 43210' },
  { id: 2, name: 'Meera Patel', email: 'meera@company.com', role: 'Product Designer', department: 'Design', status: 'Completed', startDate: '2026-10-28', phone: '+91 98765 43211' },
  { id: 3, name: 'Rohan Verma', email: 'rohan@company.com', role: 'Business Analyst', department: 'Operations', status: 'Pending', startDate: '2026-11-18', phone: '+91 98765 43212' },
  { id: 4, name: 'Diya Nair', email: 'diya@company.com', role: 'HR Executive', department: 'Human Resources', status: 'Completed', startDate: '2026-10-20', phone: '+91 98765 43213' },
];

const loadEmployees = () => {
  const savedEmployees = localStorage.getItem('employeeOnboardingData');
  return savedEmployees ? JSON.parse(savedEmployees) : initialEmployees;
};

const employeesSlice = createSlice({
  name: 'employees',
  initialState: { items: loadEmployees() },
  reducers: {
    addEmployee(state, action) {
      state.items.push({ ...action.payload, id: Date.now(), status: 'Submitted to HR', submittedAt: new Date().toISOString() });
      localStorage.setItem('employeeOnboardingData', JSON.stringify(state.items));
    },
    updateEmployeeStatus(state, action) {
      const employee = state.items.find((item) => item.id === action.payload.id);
      if (employee) employee.status = action.payload.status;
      localStorage.setItem('employeeOnboardingData', JSON.stringify(state.items));
    },
    deleteEmployee(state, action) {
      state.items = state.items.filter((employee) => employee.id !== action.payload);
      localStorage.setItem('employeeOnboardingData', JSON.stringify(state.items));
    },
    approveEmployee(state, action) {
      const employee = state.items.find((item) => item.id === action.payload.id);
      if (employee) {
        employee.status = 'Verified & Onboarding Complete';
        employee.approvedAt = new Date().toISOString();
        employee.approvedBy = action.payload.approvedBy;
      }
      localStorage.setItem('employeeOnboardingData', JSON.stringify(state.items));
    },
    rejectEmployee(state, action) {
      const employee = state.items.find((item) => item.id === action.payload.id);
      if (employee) {
        employee.status = 'Rejected - Correction Required';
        employee.rejectionRemark = action.payload.remark;
        employee.rejectedAt = new Date().toISOString();
        employee.rejectedBy = action.payload.rejectedBy;
      }
      localStorage.setItem('employeeOnboardingData', JSON.stringify(state.items));
    },
    updateEmployee(state, action) {
      const index = state.items.findIndex((employee) => employee.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...action.payload.data,
          status: 'Resubmitted to HR',
          rejectionRemark: '',
          submittedAt: new Date().toISOString(),
        };
      }
      localStorage.setItem('employeeOnboardingData', JSON.stringify(state.items));
    },
  },
});

export const { addEmployee, updateEmployeeStatus, approveEmployee, rejectEmployee, updateEmployee, deleteEmployee } = employeesSlice.actions;
export default employeesSlice.reducer;
