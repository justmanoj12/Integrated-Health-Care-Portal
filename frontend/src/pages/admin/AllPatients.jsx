import { useEffect, useState } from 'react'
import { adminService } from '../../services/api'
import { FiUsers, FiMail, FiCalendar, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'

const AllPatients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await adminService.getPatients()
      setPatients(response.data.patients)
    } catch (error) {
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient => {
    const name = `${patient.profile?.firstName || ''} ${patient.profile?.lastName || ''}`.toLowerCase()
    const email = patient.email?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    return name.includes(search) || email.includes(search)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-5xl font-bold gradient-text mb-3">All Patients</h1>
          <p className="text-xl text-gray-600">Manage and view all registered patients</p>
        </div>
      </div>

      {/* Search */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No patients found</p>
          </div>
        ) : (
          filteredPatients.map((patient, idx) => (
            <div
              key={patient._id}
              className="card hover-lift animate-scale-in group"
              style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <FiUsers className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {patient.profile?.firstName} {patient.profile?.lastName}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FiMail className="w-4 h-4" />
                      <span>{patient.email}</span>
                    </div>
                    {patient.profile?.dateOfBirth && (
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        <span>{new Date(patient.profile.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  {patient.profile?.phone && (
                    <div className="mt-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {patient.profile.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Patients</p>
            <p className="text-3xl font-bold gradient-text mt-2">{patients.length}</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FiUsers className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllPatients

