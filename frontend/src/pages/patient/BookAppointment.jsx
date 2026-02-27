import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { doctorService, appointmentService } from '../../services/api'
import toast from 'react-hot-toast'
import { FiCalendar, FiClock } from 'react-icons/fi'

const BookAppointment = () => {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm()

  const selectedDate = watch('appointmentDate')
  const selectedTime = watch('appointmentTime')

  useEffect(() => {
    fetchDoctor()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId])

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate)
    } else {
      setAvailableSlots([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, doctorId])

  const fetchDoctor = async () => {
    try {
      const response = await doctorService.getList()
      const foundDoctor = response.data.doctors.find(
        (d) => d._id === doctorId
      )
      setDoctor(foundDoctor)
    } catch (error) {
      toast.error('Error fetching doctor details')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailability = async (date) => {
    setLoadingSlots(true)
    try {
      const response = await doctorService.getAvailability(doctorId, { date })
      const slots = response.data.availableSlots || []
      setAvailableSlots(slots)

      // Clear selected time if it is no longer available for the chosen date
      if (selectedTime && !slots.includes(selectedTime)) {
        setValue('appointmentTime', '')
      }
    } catch (error) {
      console.error('Error fetching availability', error)
      toast.error('Error fetching availability for this date')
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      await appointmentService.create({
        doctorId,
        ...data,
      })
      toast.success('Appointment booked successfully!')
      navigate('/appointments')
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Error booking appointment'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading doctor details...</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-700 font-semibold">Doctor not found.</p>
        <button
          type="button"
          onClick={() => navigate('/doctors')}
          className="btn-primary mt-4"
        >
          Back to doctors
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
          Book appointment
        </h1>
        <p className="text-gray-600 text-base md:text-lg">
          Schedule a visit with Dr. {doctor.profile?.firstName}{' '}
          {doctor.profile?.lastName}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 card animate-slide-up">
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
              1
            </span>
            <span className="font-medium">Choose date and time</span>
            <span className="w-px h-5 bg-gray-200 mx-2" />
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
              2
            </span>
            <span className="font-medium">Describe your visit</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    {...register('appointmentDate', {
                      required: 'Date is required',
                      validate: (value) => {
                        const selected = new Date(value)
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        return (
                          selected >= today ||
                          'Date must be today or later'
                        )
                      },
                    })}
                    className="input-field pl-9"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.appointmentDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.appointmentDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Time
                </label>
                <div className="relative">
                  <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    {...register('appointmentTime', {
                      required: 'Please select an available time slot',
                    })}
                    className="input-field pl-9"
                    disabled={
                      !selectedDate || loadingSlots || availableSlots.length === 0
                    }
                    defaultValue=""
                  >
                    <option value="" disabled>
                      {selectedDate
                        ? loadingSlots
                          ? 'Loading available slots...'
                          : availableSlots.length === 0
                          ? 'No slots available for this day'
                          : 'Select a time slot'
                        : 'Select a date first'}
                    </option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.appointmentTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.appointmentTime.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for visit
              </label>
              <textarea
                {...register('reason', {
                  required: 'Reason is required',
                  minLength: {
                    value: 10,
                    message: 'Please provide more details',
                  },
                })}
                className="input-field"
                rows="4"
                placeholder="Describe your symptoms or reason for the appointment..."
              />
              {errors.reason && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.reason.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment type
                </label>
                <select
                  {...register('appointmentType')}
                  className="input-field"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="checkup">Checkup</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional notes (optional)
                </label>
                <textarea
                  {...register('notes')}
                  className="input-field"
                  rows="3"
                  placeholder="Any additional information for the doctor..."
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1"
              >
                {submitting ? 'Booking...' : 'Confirm booking'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/doctors')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Doctor + summary */}
        <div className="space-y-4">
          <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-semibold mb-4">Doctor information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">
                  Dr. {doctor.profile?.firstName}{' '}
                  {doctor.profile?.lastName}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Specialization</p>
                <p className="font-semibold text-gray-900">
                  {doctor.doctorInfo?.specialization ||
                    'General Practitioner'}
                </p>
              </div>
              {doctor.doctorInfo?.experience && (
                <div>
                  <p className="text-gray-500">Experience</p>
                  <p className="font-semibold text-gray-900">
                    {doctor.doctorInfo.experience} years
                  </p>
                </div>
              )}
              {doctor.doctorInfo?.consultationFee && (
                <div>
                  <p className="text-gray-500">Consultation fee</p>
                  <p className="font-semibold text-blue-600">
                    ₹{doctor.doctorInfo.consultationFee}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Your selection
            </h3>
            {selectedDate || selectedTime ? (
              <div className="space-y-2 text-sm text-gray-700">
                {selectedDate && (
                  <p>
                    <span className="font-semibold">Date: </span>
                    {selectedDate}
                  </p>
                )}
                {selectedTime && (
                  <p>
                    <span className="font-semibold">Time: </span>
                    {selectedTime}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Choose a date and time on the left to see a quick summary
                here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookAppointment

