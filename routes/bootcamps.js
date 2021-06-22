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

// Advance result middleware
const advancedResult = require('../middlewares/advancedResult');

// Load other resources route
const courseRoute = require('./courses');

const router = express.Router();

// Re-route to other resource
router.use('/:bootcampId/courses', courseRoute);

router
	.route('/')
	.get(advancedResult(Bootcamp, 'courses'), getBootcamps)
	.post(createBootcamp);

router
	.route('/:id')
	.get(getBootcamp)
	.put(updateBootcamp)
	.delete(deleteBootcamp);

router.route('/:id/photo').put(bootcampPhotoUpload);

module.exports = router;
