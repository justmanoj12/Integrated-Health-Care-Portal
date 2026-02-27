import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { doctorService } from '../../services/api'
import { FiUser, FiSearch, FiStar } from 'react-icons/fi'

const specializations = [
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic',
  'Psychiatrist',
  'General',
]

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDoctors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  const fetchDoctors = async () => {
    try {
      const params = searchTerm ? { specialization: searchTerm } : {}
      const response = await doctorService.getList(params)
      setDoctors(response.data.doctors)
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChipClick = (value) => {
    setSearchTerm(prev => (prev === value ? '' : value))
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
            Find your doctor
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Browse specialists and book appointments in just a few clicks.
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="card space-y-4 animate-scale-in">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by doctor name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {specializations.map((spec) => {
            const isActive =
              searchTerm.toLowerCase() === spec.toLowerCase()
            return (
              <button
                key={spec}
                type="button"
                onClick={() => handleChipClick(spec)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md'
                  : 'bg-white/80 text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                  }`}
              >
                {spec}
              </button>
            )
          })}
        </div>
      </div>

      {/* Doctors grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card shimmer h-44" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="card text-center py-14 animate-zoom-in">
          <p className="text-gray-500 font-medium">
            No doctors found for your search.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Try clearing filters or using a different specialization.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor, idx) => (
            <div
              key={doctor._id}
              className="card hover-lift animate-scale-in group"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                  {doctor.profile?.profilePicture ? (
                    <img
                      src={(() => {
                        const pic = doctor.profile.profilePicture;
                        if (pic.startsWith('http')) return pic;
                        const cleanPic = pic.replace(/^uploads[\\\/]/, '');
                        return `/uploads/${cleanPic}`;
                      })()}
                      alt={`Dr. ${doctor.profile.firstName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://ui-avatars.com/api/?name=Dr+' + (doctor.profile.firstName || 'Doctor');
                      }}
                    />
                  ) : (
                    <FiUser className="w-8 h-8 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Dr. {doctor.profile?.firstName}{' '}
                      {doctor.profile?.lastName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-yellow-500">
                      <FiStar className="w-4 h-4" />
                      <span>{doctor.doctorInfo?.averageRating?.toFixed(1) || 'New'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {doctor.doctorInfo?.specialization ||
                      'General Practitioner'}
                  </p>
                  {doctor.doctorInfo?.experience && (
                    <p className="text-xs text-gray-500 mt-1">
                      {doctor.doctorInfo.experience} years experience
                    </p>
                  )}
                  {doctor.doctorInfo?.consultationFee && (
                    <p className="text-sm font-semibold text-blue-600 mt-2">
                      ₹{doctor.doctorInfo.consultationFee}{' '}
                      <span className="text-xs text-gray-500 font-normal">
                        per consultation
                      </span>
                    </p>
                  )}
                  <Link
                    to={`/book-appointment/${doctor._id}`}
                    className="btn-primary mt-4 w-full text-center"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DoctorsList

