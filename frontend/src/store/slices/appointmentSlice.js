import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  appointments: [],
  loading: false,
  error: null,
  filters: {
    status: '',
    date: '',
  },
}

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointments: (state, action) => {
      state.appointments = action.payload
    },
    addAppointment: (state, action) => {
      state.appointments.push(action.payload)
    },
    updateAppointment: (state, action) => {
      const index = state.appointments.findIndex(
        apt => apt._id === action.payload._id
      )
      if (index !== -1) {
        state.appointments[index] = action.payload
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
  },
})

export const {
  setAppointments,
  addAppointment,
  updateAppointment,
  setLoading,
  setError,
  setFilters,
} = appointmentSlice.actions
export default appointmentSlice.reducer

