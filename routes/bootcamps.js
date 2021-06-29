const express = require('express');
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps');
const Bootcamp = require('../models/Bootcamp');

// Middlewares
const advancedResult = require('../middlewares/advancedResult');
const { protect, authorize } = require('../middlewares/auth');

// Load other resources route
const courseRoute = require('./courses');

const router = express.Router();

// Re-route to other resource
router.use('/:bootcampId/courses', courseRoute);

router
  .route('/')
  .get(advancedResult(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

module.exports = router;
