const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'Please enter a course title'],
		trim: true,
	},
	description: {
		type: String,
		required: [true, 'Please enter a course description'],
	},
	weeks: {
		type: String,
		required: [true, 'Please enter a number of weeks'],
	},
	tuition: {
		type: Number,
		required: [true, 'Please enter a tuition cost'],
	},
	minimumSkill: {
		type: String,
		required: [true, 'Please add a minimum skill'],
		enum: ['beginner', 'intermediate', 'advanced'],
	},
	scholarshipAvailable: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	bootcamp: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Bootcamp',
		required: true,
	},
	// user: {
	//   type: mongoose.Schema.Types.ObjectId,
	//   ref: 'User'
	//   required: true
	// },
});

// Static method for calculating bootcamp average tuition cost
CourseSchema.statics.calculateAverageCost = async function (bootcampId) {
	const result = await this.aggregate([
		{ $match: { bootcamp: bootcampId } },
		{ $group: { _id: '$bootcamp', averageCost: { $avg: '$tuition' } } },
	]);

	try {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
			averageCost: Math.ceil(result[0].averageCost / 10) * 10,
		});
	} catch (err) {
		console.error(err);
	}
};

// Post middleware on save to re-calculate average cost
CourseSchema.post('save', function () {
	mongoose.model('Course').calculateAverageCost(this.bootcamp);
});

// Pre middleware on remove to re-calculate average cost
CourseSchema.pre('remove', function () {
	mongoose.model('Course').calculateAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
