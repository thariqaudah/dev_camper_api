const express = require('express');
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp 
} = require('../controllers/bootcamps');
const { route } = require('./courses');

// Load other resources route
const courseRoute = require('./courses');

const router = express.Router();

// Re-route to other resource
router.use('/:bootcampId/courses', courseRoute);

router.route('/')
  .get(getBootcamps)
  .post(createBootcamp);

router.route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;