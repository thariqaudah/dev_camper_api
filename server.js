const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Route files
const bootcampsRoute = require('./routes/bootcamps');

const app = express();

// Mount routes
app.use('/api/v1/bootcamps', bootcampsRoute);

// Listen to PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`App is running in ${process.env.NODE_ENV} mode on port ${PORT}`));