import { useEffect, useState } from 'react'
import { patientService } from '../../services/api'
import { format } from 'date-fns'
import { FiFileText, FiCalendar } from 'react-icons/fi'

const MedicalRecords = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const response = await patientService.getMedicalRecords()
      setRecords(response.data.records)
    } catch (error) {
      console.error('Error fetching medical records:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading medical records...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Medical Records</h1>
        <p className="text-gray-600 mt-2">View your medical history and records</p>
      </div>

      {records.length === 0 ? (
        <div className="card text-center py-12">
          <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No medical records found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{record.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      <span>{format(new Date(record.date), 'PPP')}</span>
                    </div>
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                      {record.recordType}
                    </span>
                  </div>
                </div>
              </div>

              {record.description && (
                <p className="text-gray-600 mb-3">{record.description}</p>
              )}

              {record.hospital && (
                <p className="text-sm text-gray-500">Hospital: {record.hospital}</p>
              )}

              {record.tags && record.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {record.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MedicalRecords

