import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { appointmentService } from '../services/api'
import { setAppointments, updateAppointment } from '../store/slices/appointmentSlice'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { FiCalendar, FiClock, FiUser, FiX, FiCheckCircle, FiAlertCircle, FiFilter, FiFileText, FiStar } from 'react-icons/fi'
import PrescriptionModal from '../components/PrescriptionModal'
import ReviewModal from '../components/ReviewModal'

const Appointments = () => {
  const dispatch = useDispatch()
  const { appointments } = useSelector(state => state.appointments)
  const { user } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const params = filter ? { status: filter } : {}
      const response = await appointmentService.getAll(params)
      dispatch(setAppointments(response.data.appointments))
    } catch (error) {
      toast.error('Error fetching appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await appointmentService.updateStatus(id, status)
      dispatch(updateAppointment(response.data.appointment))
      toast.success('Appointment status updated')
    } catch (error) {
      toast.error('Error updating appointment')
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return

    try {
      await appointmentService.cancel(id)
      fetchAppointments()
      toast.success('Appointment cancelled')
    } catch (error) {
      toast.error('Error cancelling appointment')
    }
  }

  const openPrescriptionModal = (appointment, mode) => {
    setSelectedAppointment(appointment)
    setModalMode(mode)
    setIsPrescriptionModalOpen(true)
  }

  const openReviewModal = (appointment) => {
    setSelectedAppointment(appointment)
    setIsReviewModalOpen(true)
  }

  const safeFormatDate = (dateString) => {
    try {
      if (!dateString) return 'Date not available'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      return format(date, 'PPP')
    } catch (error) {
      return 'Date Error'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FiCheckCircle className="w-4 h-4" />
      case 'pending':
        return <FiClock className="w-4 h-4" />
      case 'completed':
        return <FiCheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <FiX className="w-4 h-4" />
      default:
        return <FiAlertCircle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-5xl font-bold gradient-text mb-3">Appointments</h1>
          <p className="text-xl text-gray-600">Manage your appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-auto min-w-[180px]"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {!Array.isArray(appointments) || appointments.length === 0 ? (
        <div className="card text-center py-16 animate-zoom-in">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCalendar className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No appointments found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {appointments.map((apt, idx) => {
            if (!apt) return null;
            return (
              <div
                key={apt._id}
                className="card hover-lift animate-scale-in group"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{apt.reason}</h3>
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 flex items-center gap-1.5 ${getStatusColor(apt.status)}`}>
                        {getStatusIcon(apt.status)}
                        {apt.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <FiCalendar className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">{safeFormatDate(apt.appointmentDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <FiClock className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">{apt.appointmentTime}</span>
                      </div>
                      {user?.role === 'patient' && apt.doctorId && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <FiUser className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">
                            Dr. {apt.doctorId.profile?.firstName} {apt.doctorId.profile?.lastName}
                          </span>
                        </div>
                      )}
                      {user?.role === 'doctor' && apt.patientId && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <FiUser className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">
                            {apt.patientId.profile?.firstName} {apt.patientId.profile?.lastName}
                          </span>
                        </div>
                      )}
                    </div>

                    {apt.notes && (
                      <div className="p-3 bg-gray-50 rounded-xl border-l-4 border-blue-500">
                        <p className="text-sm text-gray-700">{apt.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  {user?.role === 'doctor' && apt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                        className="flex-1 btn-primary text-sm py-2"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleCancel(apt._id)}
                        className="flex-1 btn-secondary text-sm py-2 text-red-600 hover:bg-red-50"
                      >
                        <FiX className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  {user?.role === 'doctor' && apt.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(apt._id, 'completed')}
                      className="w-full btn-primary text-sm py-2"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      Mark Complete
                    </button>
                  )}

                  {/* Prescription Buttons */}
                  {/* Doctor: Add Prescription for Completed Appointments */}
                  {user?.role === 'doctor' && apt.status === 'completed' && !apt.prescriptionId && (
                    <button
                      onClick={() => openPrescriptionModal(apt, 'create')}
                      className="w-full btn-primary text-sm py-2 bg-purple-600 hover:bg-purple-700"
                    >
                      <FiFileText className="w-4 h-4" />
                      Add Prescription
                    </button>
                  )}

                  {/* Doctor/Patient: View Prescription */}
                  {apt.status === 'completed' && apt.prescriptionId && (
                    <button
                      onClick={() => openPrescriptionModal(apt, 'view')}
                      className="w-full btn-secondary text-sm py-2 text-purple-600 hover:bg-purple-50"
                    >
                      <FiFileText className="w-4 h-4" />
                      View Prescription
                    </button>
                  )}

                  {/* Patient: Rate Doctor */}
                  {user?.role === 'patient' && apt.status === 'completed' && !apt.isRated && (
                    <button
                      onClick={() => openReviewModal(apt)}
                      className="w-full btn-primary text-sm py-2 bg-yellow-400 hover:bg-yellow-500 text-white border-none"
                    >
                      <FiStar className="w-4 h-4 fill-white" />
                      Rate Doctor
                    </button>
                  )}

                  {user?.role === 'patient' && apt.status !== 'cancelled' && apt.status !== 'completed' && (
                    <button
                      onClick={() => handleCancel(apt._id)}
                      className="w-full btn-secondary text-sm py-2 text-red-600 hover:bg-red-50"
                    >
                      <FiX className="w-4 h-4" />
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={(refresh) => {
          setIsPrescriptionModalOpen(false)
          setSelectedAppointment(null)
          if (refresh) fetchAppointments()
        }}
        appointment={selectedAppointment}
        mode={modalMode}
      />
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false)
          setSelectedAppointment(null)
        }}
        appointment={selectedAppointment}
        onSuccess={fetchAppointments}
      />
    </div>
  )
}

export default Appointments
