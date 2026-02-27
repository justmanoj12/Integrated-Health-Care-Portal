import { useEffect, useState } from 'react'
import { adminService } from '../../services/api'
import {
  FiUsers,
  FiMail,
  FiSearch,
  FiCheck,
  FiXCircle,
  FiClock,
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const DoctorRequests = () => {
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    fetchPendingDoctors()
  }, [])

  const fetchPendingDoctors = async () => {
    setLoading(true)
    try {
      const usersRes = await adminService.getUsers({ role: 'doctor' })
      const allDoctorUsers = usersRes.data.users || []

      const pending = allDoctorUsers.filter(
        (u) => u.status && u.status !== 'active'
      )
      setPendingDoctors(pending)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load doctor requests')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (userId, nextStatus) => {
    setUpdatingId(userId)
    try {
      const payload =
        nextStatus === 'active'
          ? { status: 'active', isActive: true }
          : { status: 'rejected', isActive: false }

      await adminService.updateUserStatus(userId, payload)
      toast.success(
        nextStatus === 'active'
          ? 'Doctor approved successfully'
          : 'Doctor rejected/disabled'
      )
      await fetchPendingDoctors()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to update doctor status'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredPending = pendingDoctors.filter((doc) => {
    const email = doc.email?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    return email.includes(search)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-5xl font-bold gradient-text mb-3">
            Doctor Requests
          </h1>
          <p className="text-xl text-gray-600">
            Review and approve or reject new doctor account requests
          </p>
        </div>
      </div>

      {/* Search */}
      <div
        className="card animate-slide-up"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search requests by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>
      </div>

      <div
        className="card animate-slide-up border border-yellow-200/80 bg-yellow-50/80"
        style={{ animationDelay: '0.25s' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiClock className="w-5 h-5 text-yellow-600" />
            <h2 className="text-xl font-semibold text-yellow-900">
              Pending Doctor Approvals
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
            {filteredPending.length} pending
          </span>
        </div>

        {filteredPending.length === 0 ? (
          <p className="text-sm text-yellow-800">
            No doctor accounts are currently awaiting approval.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredPending.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-yellow-100"
              >
                <div>
                  <p className="font-semibold text-gray-900">{doc.email}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Status:{' '}
                    <span className="font-semibold capitalize">
                      {doc.status}
                    </span>
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Created:{' '}
                    {doc.created_at
                      ? new Date(doc.created_at).toLocaleString()
                      : '—'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(doc.id, 'active')}
                    disabled={updatingId === doc.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <FiCheck className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(doc.id, 'rejected')}
                    disabled={updatingId === doc.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <FiXCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simple stat */}
      <div
        className="card animate-slide-up"
        style={{ animationDelay: '0.4s' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">
              Total Pending Requests
            </p>
            <p className="text-3xl font-bold gradient-text mt-2">
              {pendingDoctors.length}
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
            <FiUsers className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorRequests


