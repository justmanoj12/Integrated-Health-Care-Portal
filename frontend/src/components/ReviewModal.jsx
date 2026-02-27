import { useState } from 'react'
import { FiStar, FiX } from 'react-icons/fi'
import { reviewService } from '../services/api'
import toast from 'react-hot-toast'

const ReviewModal = ({ isOpen, onClose, appointment, onSuccess }) => {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isOpen || !appointment) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (rating === 0) {
            toast.error('Please select a rating')
            return
        }

        setLoading(true)
        try {
            await reviewService.create({
                doctorId: appointment.doctorId._id,
                appointmentId: appointment._id,
                rating,
                comment
            })
            toast.success('Review submitted successfully')
            onSuccess()
            onClose()
        } catch (error) {
            // Handle "already rated" specifically if needed, though backend covers it
            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error('Error submitting review')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Rate your experience</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiX className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="text-center mb-8">
                    <p className="text-gray-600 mb-4">
                        How was your appointment with <br />
                        <span className="font-semibold text-gray-900">Dr. {appointment.doctorId?.profile?.firstName} {appointment.doctorId?.profile?.lastName}</span>?
                    </p>

                    <div className="flex justify-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                            >
                                <FiStar
                                    className={`w-10 h-10 transition-colors duration-200 ${star <= (hoverRating || rating)
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 font-medium h-5">
                        {hoverRating === 1 && 'Poor'}
                        {hoverRating === 2 && 'Fair'}
                        {hoverRating === 3 && 'Good'}
                        {hoverRating === 4 && 'Very Good'}
                        {hoverRating === 5 && 'Excellent'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add a comment (optional)
                        </label>
                        <textarea
                            rows="4"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="input-field resize-none"
                            placeholder="Tell us about your experience..."
                        ></textarea>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || rating === 0}
                            className="flex-1 btn-primary"
                        >
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ReviewModal
