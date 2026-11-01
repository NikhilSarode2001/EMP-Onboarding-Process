import { createSlice } from '@reduxjs/toolkit';

const savedUser = JSON.parse(localStorage.getItem('employeePortalUser') || 'null');

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: savedUser, error: '' },
  reducers: {
    login(state, action) {
      state.user = action.payload;
      state.error = '';
      localStorage.setItem('employeePortalUser', JSON.stringify(action.payload));
    },
    loginFailed(state, action) {
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.error = '';
      localStorage.removeItem('employeePortalUser');
    },
  },
});

export const { login, loginFailed, logout } = authSlice.actions;
export default authSlice.reducer;
