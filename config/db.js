const mongoose = require('mongoose');
const { connect } = require('../routes/bootcamps');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });
  
  console.log(`MongoDB Connected: ${conn.connection.host}`.magenta);
}

module.exports = connectDB;