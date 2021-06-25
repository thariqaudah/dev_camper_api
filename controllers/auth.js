const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middlewares/async');

// @desc      Register new user
// @path      POST /register
// @access    Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  res.end('registered');
});
