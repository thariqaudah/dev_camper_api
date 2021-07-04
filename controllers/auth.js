const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middlewares/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// @desc      Register new user
// @route     POST api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, role, password } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    role,
    password,
  });

  sendTokenResponse(user, 200, res);
});

// @desc      Login user
// @route     POST api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate user input
  if (!email || !password) {
    return next(new ErrorResponse('Please enter an email and password', 400));
  }

  // Find user
  const user = await User.findOne({ email }).select('+password');

  // Check if email is exist
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Verfiy if password match with the hashed password in database
  const isVerify = await user.verifyPassword(password);
  if (!isVerify) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Get logged in user
// @route     GET api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Forgot password
// @route     POST api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset password token
  const resetToken = user.getResetPasswordToken();

  // Save to database
  await user.save({ validateBeforeSave: false });

  // Construct reset password url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword`;

  // Create message
  const message = `You got this email because you (or someone else) request a reset password. Please make a PUT request to this url: \n ${resetUrl}`;

  // Send email for reset token url
  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset Password Token',
      message,
    });

    res.status(200).json({
      success: true,
      data: 'Email sent',
    });
  } catch (err) {
    console.error(err);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    next(new ErrorResponse(`Email could not be sent`, 500));
  }
});

// Helper for Sending Token Response
const sendTokenResponse = (user, statusCode, res) => {
  // Get JWT token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
