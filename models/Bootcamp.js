const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please enter a name'],
			unique: [true, 'That name already exist'],
			trim: true,
			maxLength: [50, 'Name can not be greater than 50 characters'],
		},
		slug: String,
		description: {
			type: String,
			required: [true, 'Please enter a description'],
			maxLength: [500, 'Description can not be greater than 500 characters'],
		},
		website: {
			type: String,
			match: [
				/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
				'Please enter a valid URL with HTTP or HTTPS',
			],
		},
		phone: {
			type: String,
			maxLength: [20, 'Phone number can not be longer than 20 characters'],
		},
		email: {
			type: String,
			match: [
				/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
				'Please enter a valid email address',
			],
		},
		address: {
			type: String,
			required: [true, 'Please enter an address'],
		},
		location: {
			// GeoJSON Point
			type: {
				type: String,
				enum: ['Point'],
			},
			coordinates: {
				type: [Number],
				index: '2dsphere',
			},
			formattedAddress: String,
			street: String,
			city: String,
			state: String,
			zipcode: String,
			country: String,
		},
		careers: {
			type: [String],
			required: true,
			enum: [
				'Web Development',
				'Mobile Development',
				'UI/UX',
				'Data Science',
				'Machine Learning',
				'Business',
				'Other',
			],
		},
		averageRating: {
			type: Number,
			minLength: [1, 'Rating must be at least 1'],
			maxLength: [10, 'Rating can not be greater than 10'],
		},
		averageCost: Number,
		photo: {
			type: String,
			default: 'no-photo.jpg',
		},
		housing: {
			type: Boolean,
			default: false,
		},
		jobAssistance: {
			type: Boolean,
			default: false,
		},
		jobGuarantee: {
			type: Boolean,
			default: false,
		},
		acceptGi: {
			type: Boolean,
			default: false,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Pre middleware for create slug
BootcampSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { remove: /[*+~.()'"!:@]/g, lower: true });
	next();
});

// Pre middleware for save geocode location
BootcampSchema.pre('save', async function (next) {
	const loc = await geocoder.geocode(this.address);
	this.location = {
		type: 'Point',
		coordinates: [loc[0].longitude, loc[0].latitude],
		formattedAddress: loc[0].formattedAddress,
		street: loc[0].streetName,
		city: loc[0].city,
		state: loc[0].stateCode,
		zipcode: loc[0].zipcode,
		country: loc[0].countryCode,
	};
	// Do not save the address field
	this.address = undefined;
	next();
});

// Virtual field of courses for bootcamp
BootcampSchema.virtual('courses', {
	ref: 'Course',
	localField: '_id',
	foreignField: 'bootcamp',
	justOne: false,
});

// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove', async function (next) {
	console.log(`Courses for bootcamp ${this._id} are deleted`);
	await mongoose.model('Course').deleteMany({ bootcamp: this._id });
	next();
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);
