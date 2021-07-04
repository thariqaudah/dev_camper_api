const path = require('path');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middlewares/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // Sending response
  res.status(200).json(res.advancedResult);
});

// @desc      Get single bootcamp
// @route     GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id).populate('courses');

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Resource with id of ${req.params.id} is not found`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamps
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user id to req.body
  req.body.user = req.user._id;

  // Check for published bootcamp by the user
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user._id });

  // If user is not an admin, they just could publish one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id of ${req.user._id} has already published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc      Update bootcamps
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  // Check if bootcamp exist
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Resource with id of ${req.params.id} is not found`,
        404
      )
    );
  }

  // Check if user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc      Delete bootcamps
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  // Check if bootcamp exist
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Resource with id of ${req.params.id} is not found`,
        404
      )
    );
  }

  // Check if user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this bootcamp`,
        401
      )
    );
  }

  await bootcamp.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Get Bootcamps within a radius
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
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc      PUT Upload bootcamp photo
// @route     GET /api/v1/bootcamps/:id/photo
// @access    Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  // Check if bootcamp exist
  if (!bootcamp) {
    next(
      new ErrorResponse(
        `Bootcamp with id of ${req.params.id} is not found`,
        404
      )
    );
  }

  // Check if user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorize to update photo of this bootcamp`,
        401
      )
    );
  }

  // Check if file is exist
  if (!req.files) {
    next(new ErrorResponse(`Please upload a photo`, 400));
  }

  const photo = req.files.photo;

  // Check if photo is an image file
  if (!photo.mimetype.includes('image')) {
    next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check if photo is less than max size
  if (photo.size > process.env.PHOTO_MAX_SIZE) {
    next(
      new ErrorResponse(
        `Photo file size should be less than ${process.env.PHOTO_MAX_SIZE} bytes`,
        400
      )
    );
  }

  // Create custom file name
  photo.name = `photo_${bootcamp._id}${path.parse(photo.name).ext}`;

  // Upload photo
  photo.mv(`${process.env.PHOTO_FILE_PATH}/${photo.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(
        new ErrorResponse(`Something gone wrong with photo upload`, 500)
      );
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(
      req.params.id,
      {
        photo: photo.name,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: bootcamp.photo,
    });
  });
});
