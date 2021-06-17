const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middlewares/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // Initialize query variable
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Field to be excluded from filtering
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop through removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, $lt, etc...)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Build query
  query = Bootcamp.find(JSON.parse(queryStr));

  // Select
  if (req.query.select) {
    const selectedFields = req.query.select.split(',').join(' ');
    query = query.select(selectedFields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;
  const endIndex = page * limit;
  const totalIndex = await Bootcamp.countDocuments();

  query = query.skip(skip).limit(limit).populate('courses');

  // Executing query
  const bootcamps = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < totalIndex) {
    pagination.next = {
      page: page + 1,
      limit
    }
  }

  if (skip > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    }
  }

  // Response
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps
  });
});

// @desc      Get single bootcamp
// @route     GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Resource with id of ${req.params.id} is not found`, 404));
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamps
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

// @desc      Update bootcamps
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!bootcamp) {
    return next(new ErrorResponse(`Resource with id of ${req.params.id} is not found`, 404));
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

// @desc      Delete bootcamps
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Resource with id of ${req.params.id} is not found`, 404));
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius by radians
  // Divided by radius of Earth
  // Radius of Earth is 3963 mi / 6378 km
  const radius = distance / 3963;

  // Find bootcamps
  const bootcamps = await Bootcamp.find({ 
    location: { $geoWithin: { $centerSphere: [ [lng, lat], radius ] } } });
 
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});