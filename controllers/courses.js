const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middlewares/async');
const Course = require('../models/Course');

// @desc    Get courses
// @route   GET /courses
// @route   GET /bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId }).populate({ path: 'bootcamp', select: 'name description' });
  } else {
    query = Course.find().populate({ path: 'bootcamp', select: 'name description' });
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});