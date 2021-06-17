const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter a course title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please enter a course description'],
  },
  weeks: {
    type: Number,
    required: [true, 'Please enter a number of weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please enter a tuition cost'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User'
  //   required: true
  // },
});

module.exports = mongoose.model('Course', CourseSchema);