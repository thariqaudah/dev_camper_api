const ErrorResponse = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
  // Make copy of err object to error variable
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log(err);

  //  Mongoose Bad ObjectID
  if (err.name === 'CastError') {
    const message = `Resource with id of ${err.value} is not found`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate field value entered for ${err.keyValue.name}`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    // let errors = [];
    // Object.values(err.errors).forEach(({ properties }) => {
    //   errors.push(properties.message);
    // });
    // const message = errors.join(', ');
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
}

module.exports = errorHandler;