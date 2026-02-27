const mongoose = require('mongoose');
const Review = require('../models/Review.model');
const Appointment = require('../models/Appointment.model');
const User = require('../models/User.model');

// Create a new review
exports.createReview = async (req, res) => {
    try {
        const { doctorId, appointmentId, rating, comment } = req.body;
        const patientId = req.user.id; // From auth middleware

        // 1. Verify appointment exists and belongs to patient
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            patientId: patientId,
            doctorId: doctorId,
            status: 'completed'
        });

        if (!appointment) {
            return res.status(400).json({ message: 'Invalid appointment or appointment not completed' });
        }

        if (appointment.isRated) {
            return res.status(400).json({ message: 'Appointment already rated' });
        }

        // 2. Create Review
        const review = new Review({
            patientId,
            doctorId,
            appointmentId,
            rating,
            comment
        });

        await review.save();

        // 3. Mark appointment as rated
        appointment.isRated = true;
        await appointment.save();

        // 4. Update Doctor's average rating
        // Recalculate average
        const stats = await Review.aggregate([
            { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } }, // Ensure ObjectId
            {
                $group: {
                    _id: '$doctorId',
                    averageRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            await User.findByIdAndUpdate(doctorId, {
                'doctorInfo.averageRating': Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
                'doctorInfo.totalRatings': stats[0].totalRatings
            });
        }

        res.status(201).json({ message: 'Review submitted successfully', review });

    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Error submitting review' });
    }
};

// Get reviews for a doctor
exports.getDoctorReviews = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const reviews = await Review.find({ doctorId })
            .populate('patientId', 'profile.firstName profile.lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({ reviews });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
};
