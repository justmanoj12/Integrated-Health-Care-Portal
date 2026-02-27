import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { setUser } from '../store/slices/authSlice'
import { patientService, doctorService } from '../services/api'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiPhone, FiMapPin, FiClock, FiCalendar, FiPlus, FiX } from 'react-icons/fi'

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const Profile = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  const [availabilitySlots, setAvailabilitySlots] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      let response
      if (user?.role === 'patient') {
        response = await patientService.getProfile()
      } else if (user?.role === 'doctor') {
        response = await doctorService.getProfile()
      }
      if (response) {
        const nextProfile = response.data.user || response.data.doctor
        setProfile(nextProfile)
        reset(nextProfile)

        // Initialize availability slots for doctors
        if (user?.role === 'doctor' && nextProfile.doctorInfo?.availableSlots) {
          setAvailabilitySlots(nextProfile.doctorInfo.availableSlots)
        } else if (user?.role === 'doctor') {
          setAvailabilitySlots([{ day: '', startTime: '', endTime: '' }])
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const formData = new FormData()

      // Append basic fields (text)
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          // Skip complex fields we handle manually if needed, or just let them append.
          // However, for objects like availableSlots, we might need JSON.stringify if backend expects it.
          // For now, let's filter out 'availableSlots' from direct append if we handle it separately
          if (key !== 'availableSlots' && key !== 'qualifications' && key !== 'address' && key !== 'emergencyContact') {
            formData.append(key, data[key])
          }
        }
      })

      if (user?.role === 'doctor') {
        // Handle availableSlots
        const validSlots = availabilitySlots.filter(
          slot => slot.day && slot.startTime && slot.endTime
        )
        formData.append('availableSlots', JSON.stringify(validSlots))

        if (profile.doctorInfo?.qualifications) {
          formData.append('qualifications', JSON.stringify(profile.doctorInfo.qualifications))
        }
      }

      if (selectedFile) {
        formData.append('profilePicture', selectedFile)
      }

      // Handle Patient complex fields
      if (user?.role === 'patient') {
        // If the form has updated address fields, they should be in 'data' if we registered them.
        // But Profile.jsx currently only registers basic fields and bloodGroup.
        // Looking at lines 390+, only bloodGroup is registered for Patient.
        // Address is not even in the form inputs currently shown in the file view.
        // So we might not need to send address/emergencyContact if they aren't editable.
        // BUT, if they are in 'data' (e.g. from defaultValues), they might be sent.
        // Let's check if 'data' has them.
        if (data.address) formData.append('address', JSON.stringify(data.address))
        if (data.emergencyContact) formData.append('emergencyContact', JSON.stringify(data.emergencyContact))

        // If implementation of address inputs is missing, we at least prevent [object Object] error
        // by filtering them out in the loop above.
      }

      let response
      if (user?.role === 'patient') {
        response = await patientService.updateProfile(formData)
      } else if (user?.role === 'doctor') {
        response = await doctorService.updateProfile(formData)
      }

      if (response) {
        const updatedProfile = response.data.user || response.data.doctor
        setProfile(updatedProfile)
        // Update Redux state so Navbar reflects changes immediately
        dispatch(setUser({ ...user, profile: updatedProfile.profile, doctorInfo: updatedProfile.doctorInfo, patientInfo: updatedProfile.patientInfo }))

        if (user?.role === 'doctor' && updatedProfile.doctorInfo?.availableSlots) {
          setAvailabilitySlots(updatedProfile.doctorInfo.availableSlots)
        }
        toast.success('Profile updated successfully')
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  const addAvailabilitySlot = () => {
    setAvailabilitySlots([...availabilitySlots, { day: '', startTime: '', endTime: '' }])
  }

  const removeAvailabilitySlot = (index) => {
    const newSlots = availabilitySlots.filter((_, i) => i !== index)
    setAvailabilitySlots(newSlots)
  }

  const updateAvailabilitySlot = (index, field, value) => {
    const newSlots = [...availabilitySlots]
    newSlots[index] = { ...newSlots[index], [field]: value }
    setAvailabilitySlots(newSlots)
  }

  if (!profile) {
    return <div className="text-center py-12">Loading profile...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your profile information</p>
      </div>



      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Photo Upload */}
          <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                {imagePreview || profile?.profile?.profilePicture ? (
                  <img
                    src={imagePreview || (() => {
                      const pic = profile?.profile?.profilePicture;
                      if (!pic) return null;

                      // Fix: If DB has hardcoded localhost:5000 or 127.0.0.1:5000, strip it
                      let cleanPic = pic;
                      if (pic.includes('5000') && pic.includes('/uploads/')) {
                        cleanPic = pic.split('/uploads/')[1];
                      } else if (pic.startsWith('http')) {
                        return pic;
                      }

                      cleanPic = cleanPic.replace(/^uploads[\\\/]/, '');
                      // Use relative path (proxied by Vite)
                      return `/uploads/${cleanPic}?t=${new Date().getTime()}`;
                    })()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://ui-avatars.com/api/?name=' + (profile.profile.firstName || 'User');
                    }}
                  />

                ) : (
                  <FiUser className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <label
                htmlFor="profile-upload"
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-semibold"
              >
                Change
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Profile Photo</h3>
              <p className="text-sm text-gray-500">Upload a clear photo of yourself.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                {...register('firstName', { required: 'First name is required' })}
                className="input-field"
                defaultValue={profile.profile?.firstName}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                {...register('lastName', { required: 'Last name is required' })}
                className="input-field"
                defaultValue={profile.profile?.lastName}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email}
                className="input-field bg-gray-100"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="input-field"
                defaultValue={profile.profile?.phone}
              />
            </div>
          </div>

          {user?.role === 'doctor' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    {...register('specialization')}
                    className="input-field"
                    defaultValue={profile.doctorInfo?.specialization}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    {...register('experience', { valueAsNumber: true })}
                    className="input-field"
                    defaultValue={profile.doctorInfo?.experience}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Fee
                  </label>
                  <input
                    type="number"
                    {...register('consultationFee', { valueAsNumber: true })}
                    className="input-field"
                    defaultValue={profile.doctorInfo?.consultationFee}
                  />
                </div>
              </div>

              {/* Doctor Availability Management */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FiCalendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Consultation Availability
                    </h3>
                    <p className="text-sm text-gray-500">
                      Set your working hours for each day of the week
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {availabilitySlots.map((slot, index) => (
                    <div
                      key={index}
                      className="p-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <FiCalendar className="w-4 h-4 text-blue-600" />
                            Day
                          </label>
                          <select
                            value={slot.day || ''}
                            onChange={(e) => updateAvailabilitySlot(index, 'day', e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-800 font-medium"
                          >
                            <option value="">Select day</option>
                            {daysOfWeek.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <FiClock className="w-4 h-4 text-green-600" />
                            Start Time
                          </label>
                          <div className="relative">
                            <input
                              type="time"
                              value={slot.startTime || ''}
                              onChange={(e) => updateAvailabilitySlot(index, 'startTime', e.target.value)}
                              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none text-gray-800 font-medium text-lg"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <FiClock className="w-4 h-4 text-red-600" />
                            End Time
                          </label>
                          <div className="relative">
                            <input
                              type="time"
                              value={slot.endTime || ''}
                              onChange={(e) => updateAvailabilitySlot(index, 'endTime', e.target.value)}
                              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none text-gray-800 font-medium text-lg"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-1 flex items-end">
                          {availabilitySlots.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removeAvailabilitySlot(index)}
                              className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 rounded-lg transition-all font-semibold flex items-center justify-center gap-2"
                            >
                              <FiX className="w-4 h-4" />
                              Remove
                            </button>
                          ) : (
                            <div className="w-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addAvailabilitySlot}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <FiPlus className="w-5 h-5" />
                    Add Another Day
                  </button>

                  <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Patients will only see and book appointments within these time ranges. When an appointment is confirmed, that time slot will be automatically blocked.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {user?.role === 'patient' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <input
                  type="text"
                  {...register('bloodGroup')}
                  className="input-field"
                  defaultValue={profile.patientInfo?.bloodGroup}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile

