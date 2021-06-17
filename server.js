const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middlewares/error');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Route files
const bootcampsRoute = require('./routes/bootcamps');
const coursesRoute = require('./routes/courses');

// Database connection
connectDB();

const app = express();

// Bodyparser middleware
app.use(express.json());

// Morgan middleware 
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mounting routes
app.use('/api/v1/bootcamps', bootcampsRoute);
app.use('/api/v1/courses', coursesRoute);

// Error handling middleware
app.use(errorHandler);

// Listen to PORT
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`App is running in ${process.env.NODE_ENV} mode on port ${PORT}`.bold.cyan));

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Exit server
  server.close(() => process.exit(1));
});