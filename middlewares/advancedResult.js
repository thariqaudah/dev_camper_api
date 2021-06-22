module.exports = (model, populate) => async (req, res, next) => {
	// Initialize query variable
	let query;

	// Copy req.query
	const reqQuery = { ...req.query };

	// Field to be excluded from filtering
	const removeFields = ['select', 'sort', 'page', 'limit'];

	// Loop through removeFields and delete them from reqQuery
	removeFields.forEach(param => delete reqQuery[param]);

	// Create query string
	let queryStr = JSON.stringify(reqQuery);

	// Create operators ($gt, $gte, $lt, etc...)
	queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

	// Build query
	query = model.find(JSON.parse(queryStr));

	// Select
	if (req.query.select) {
		const selectedFields = req.query.select.split(',').join(' ');
		query = query.select(selectedFields);
	}

	// Sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ');
		query = query.sort(sortBy);
	} else {
		query = query.sort('-createdAt');
	}

	// Populate
	if (populate) {
		query = query.populate(populate);
	}

	// Pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 25;
	const skip = (page - 1) * limit;
	const endIndex = page * limit;
	const totalIndex = await model.countDocuments();

	query = query.skip(skip).limit(limit);

	// Executing query
	const result = await query;

	// Pagination result
	const pagination = {};

	if (endIndex < totalIndex) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (skip > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	// Attach advance result to response obj
	res.advancedResult = {
		success: true,
		count: result.length,
		pagination,
		data: result,
	};

	next();
};
