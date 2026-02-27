import { useState, useEffect } from 'react'
import { FiX, FiPlus, FiTrash, FiFileText } from 'react-icons/fi'
import { prescriptionService } from '../services/api'
import toast from 'react-hot-toast'

const PrescriptionModal = ({ isOpen, onClose, appointment, mode = 'create' }) => { // mode: 'create' | 'view'
  const [loading, setLoading] = useState(false)
  const [prescription, setPrescription] = useState(null)
  
  // Form State
  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ])
  const [followUpDate, setFollowUpDate] = useState('')

  useEffect(() => {
    if (isOpen && appointment) {
      if (mode === 'create') {
        // Reset form for new prescription
        setDiagnosis('')
        setNotes('')
        setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
        setFollowUpDate('')
        setPrescription(null)
      } else if (mode === 'view') {
        fetchPrescription()
      }
    }
  }, [isOpen, appointment, mode])

  const fetchPrescription = async () => {
    setLoading(true)
    try {
      // If the appointment object has the full prescription populated (it might not), use it.
      // Otherwise, assume appointment.prescriptionId is the ID.
      // For safety, let's try to fetch by ID if we have it.
      
      let presId = appointment.prescriptionId
      if (typeof presId === 'object' && presId !== null) {
        presId = presId._id
      }

      if (presId) {
        const response = await prescriptionService.getById(presId)
        setPrescription(response.data.prescription)
      }
    } catch (error) {
      console.error('Error fetching prescription:', error)
      toast.error('Could not load prescription details')
    } finally {
      setLoading(false)
    }
  }

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...medications]
    newMedications[index][field] = value
    setMedications(newMedications)
  }

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  }

  const removeMedication = (index) => {
    const newMedications = medications.filter((_, i) => i !== index)
    setMedications(newMedications)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!diagnosis) {
      toast.error('Diagnosis is required')
      return
    }
    if (medications.some(m => !m.name || !m.dosage || !m.frequency || !m.duration)) {
      toast.error('Please fill in all required medication fields')
      return
    }

    setLoading(true)
    try {
      await prescriptionService.create({
        appointmentId: appointment._id,
        diagnosis,
        medications,
        notes,
        followUpDate
      })
      toast.success('Prescription created successfully')
      onClose(true) // Pass true to indicate success/refresh needed
    } catch (error) {
      console.error('Error creating prescription:', error)
      toast.error(error.response?.data?.message || 'Error creating prescription')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${mode === 'create' ? 'bg-blue-100' : 'bg-purple-100'}`}>
              <FiFileText className={`w-6 h-6 ${mode === 'create' ? 'text-blue-600' : 'text-purple-600'}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {mode === 'create' ? 'Add Prescription' : 'View Prescription'}
              </h2>
              <p className="text-sm text-gray-500">
                {appointment?.patientId?.profile?.firstName} {appointment?.patientId?.profile?.lastName}
              </p>
            </div>
          </div>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {mode === 'view' && loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading prescription...</p>
            </div>
          ) : mode === 'view' && !prescription ? (
            <div className="text-center py-12 text-gray-500">
              No prescription details found.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                {mode === 'create' ? (
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Acute Viral Fever"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-800 font-medium">
                    {prescription?.diagnosis}
                  </div>
                )}
              </div>

              {/* Medications */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Medications</label>
                  {mode === 'create' && (
                    <button
                      type="button"
                      onClick={addMedication}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <FiPlus className="w-4 h-4" /> Add Medicine
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {(mode === 'create' ? medications : prescription?.medications || []).map((med, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                      {mode === 'create' && (
                         <div className="flex justify-between mb-2">
                           <span className="text-xs font-semibold text-gray-500">Medicine {idx + 1}</span>
                           {medications.length > 1 && (
                             <button type="button" onClick={() => removeMedication(idx)} className="text-red-500 hover:text-red-700">
                               <FiTrash className="w-4 h-4" />
                             </button>
                           )}
                         </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="lg:col-span-2">
                           {mode === 'create' ? (
                             <input
                               placeholder="Medicine Name"
                               value={med.name}
                               onChange={(e) => handleMedicationChange(idx, 'name', e.target.value)}
                               className="input-field"
                             />
                           ) : (
                             <div>
                               <span className="text-xs text-gray-500 block">Name</span>
                               <span className="font-medium">{med.name}</span>
                             </div>
                           )}
                        </div>
                        <div>
                           {mode === 'create' ? (
                             <input
                               placeholder="Dosage (e.g. 500mg)"
                               value={med.dosage}
                               onChange={(e) => handleMedicationChange(idx, 'dosage', e.target.value)}
                               className="input-field"
                             />
                           ) : (
                             <div>
                               <span className="text-xs text-gray-500 block">Dosage</span>
                               <span className="font-medium">{med.dosage}</span>
                             </div>
                           )}
                        </div>
                        <div>
                           {mode === 'create' ? (
                             <input
                               placeholder="Frequency (e.g. 1-0-1)"
                               value={med.frequency}
                               onChange={(e) => handleMedicationChange(idx, 'frequency', e.target.value)}
                               className="input-field"
                             />
                           ) : (
                             <div>
                               <span className="text-xs text-gray-500 block">Frequency</span>
                               <span className="font-medium">{med.frequency}</span>
                             </div>
                           )}
                        </div>
                         <div>
                           {mode === 'create' ? (
                             <input
                               placeholder="Duration (e.g. 5 days)"
                               value={med.duration}
                               onChange={(e) => handleMedicationChange(idx, 'duration', e.target.value)}
                               className="input-field"
                             />
                           ) : (
                             <div>
                               <span className="text-xs text-gray-500 block">Duration</span>
                               <span className="font-medium">{med.duration}</span>
                             </div>
                           )}
                        </div>
                         <div className="lg:col-span-3">
                           {mode === 'create' ? (
                             <input
                               placeholder="Instructions (e.g. After food)"
                               value={med.instructions}
                               onChange={(e) => handleMedicationChange(idx, 'instructions', e.target.value)}
                               className="input-field"
                             />
                           ) : (
                             <div>
                               <span className="text-xs text-gray-500 block">Instructions</span>
                               <span className="text-gray-700">{med.instructions}</span>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes & Follow-up */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes</label>
                   {mode === 'create' ? (
                     <textarea
                       rows="3"
                       value={notes}
                       onChange={(e) => setNotes(e.target.value)}
                       className="input-field"
                       placeholder="Additional notes..."
                     />
                   ) : (
                     <p className="text-gray-700 bg-gray-50 p-3 rounded-lg min-h-[5rem]">
                       {prescription?.notes || 'No notes provided.'}
                     </p>
                   )}
                </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                   {mode === 'create' ? (
                     <input
                       type="date"
                       value={followUpDate}
                       onChange={(e) => setFollowUpDate(e.target.value)}
                       className="input-field"
                     />
                   ) : (
                     <p className="font-medium text-gray-800 p-3 bg-gray-50 rounded-lg">
                       {prescription?.followUpDate ? new Date(prescription.followUpDate).toLocaleDateString() : 'Not scheduled'}
                     </p>
                   )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => onClose(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
                {mode === 'create' && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary min-w-[120px]"
                  >
                    {loading ? 'Saving...' : 'Save Prescription'}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default PrescriptionModal
