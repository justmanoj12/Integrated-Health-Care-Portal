import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { prescriptionService } from '../services/api'
import { format } from 'date-fns'
import { FiFileText, FiCalendar, FiUser, FiActivity, FiDownload } from 'react-icons/fi'
import { FaPills } from 'react-icons/fa'

import toast from 'react-hot-toast'

const Prescriptions = () => {
  const { user } = useSelector(state => state.auth)
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const response = await prescriptionService.getAll()
      setPrescriptions(response.data.prescriptions)
    } catch (error) {
      toast.error('Error fetching prescriptions')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-5xl font-bold gradient-text mb-3">Prescriptions</h1>
        <p className="text-xl text-gray-600">View your medical prescriptions</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="card text-center py-16 animate-zoom-in">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiFileText className="w-10 h-10 text-purple-600" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No prescriptions found</p>
          <p className="text-gray-400 text-sm mt-2">Your prescriptions will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {prescriptions.map((prescription, idx) => (
            <div
              key={prescription._id}
              className="card hover-lift animate-scale-in"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-100">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FiFileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{prescription.diagnosis}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-4 h-4" />
                          <span>{format(new Date(prescription.createdAt), 'PPP')}</span>
                        </div>
                        {/* Show Patient Name if functionality is for Doctor */}
                        {user?.role === 'doctor' && prescription.patientId && (
                          <div className="flex items-center gap-2">
                            <FiUser className="w-4 h-4" />
                            <span className="font-semibold text-blue-600">{prescription.patientId.profile?.firstName} {prescription.patientId.profile?.lastName}</span>
                          </div>
                        )}

                        {/* Show Doctor Name if functionality is for Patient */}
                        {user?.role === 'patient' && prescription.doctorId && (
                          <div className="flex items-center gap-2">
                            <FiUser className="w-4 h-4" />
                            <span>Dr. {prescription.doctorId.profile?.firstName} {prescription.doctorId.profile?.lastName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                  <FiDownload className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Symptoms */}
              {prescription.symptoms && prescription.symptoms.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FiActivity className="w-5 h-5 text-red-500" />
                    <p className="text-sm font-semibold text-gray-700">Symptoms</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {prescription.symptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FaPills className="w-5 h-5 text-blue-500" />

                  <p className="text-sm font-semibold text-gray-700">Medications</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {prescription.medications.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-shadow"
                    >
                      <p className="font-bold text-gray-800 mb-1">{med.name}</p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-semibold">Dosage:</span> {med.dosage}</p>
                        <p><span className="font-semibold">Frequency:</span> {med.frequency}</p>
                        <p><span className="font-semibold">Duration:</span> {med.duration}</p>
                        {med.instructions && (
                          <p className="mt-2 text-xs text-gray-500 italic">{med.instructions}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tests */}
              {prescription.tests && prescription.tests.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FiActivity className="w-5 h-5 text-yellow-500" />
                    <p className="text-sm font-semibold text-gray-700">Recommended Tests</p>
                  </div>
                  <div className="space-y-2">
                    {prescription.tests.map((test, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-yellow-50 rounded-xl border-l-4 border-yellow-500"
                      >
                        <p className="font-semibold text-gray-800">{test.name}</p>
                        {test.description && (
                          <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {prescription.notes && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border-l-4 border-gray-400">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Additional Notes</p>
                  <p className="text-sm text-gray-600">{prescription.notes}</p>
                </div>
              )}

              {/* Follow-up */}
              {prescription.followUpDate && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-5 h-5 text-green-500" />
                    <p className="text-sm font-semibold text-gray-700">
                      Follow-up Date: <span className="text-green-600">{format(new Date(prescription.followUpDate), 'PPP')}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Prescriptions
