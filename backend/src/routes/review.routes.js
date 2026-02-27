const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// POST /api/reviews - Create review (Patient only)
router.post('/', authenticate, authorize('patient'), reviewController.createReview);

// GET /api/reviews/doctor/:doctorId - Get doctor reviews (Public or Auth)
router.get('/doctor/:doctorId', reviewController.getDoctorReviews);

module.exports = router;
