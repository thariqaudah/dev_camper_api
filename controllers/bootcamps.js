// @desc      Show all bootcamps
// @URL       GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = (req, res, next) => {
  res.json({ success: true, msg: 'Show all bootcamps' });
}

// @desc      Show single bootcamp
// @URL       GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootcamp = (req, res, next) => {
  res.json({ success: true, msg: 'Show single bootcamp' });
}

// @desc      Create new bootcamp
// @URL       POST /api/v1/bootcamps
// @access    Private
exports.createBootcamp = (req, res, next) => {
  res.json({ success: true, msg: 'Create new bootcamp' });
}

// @desc      Update bootcamps
// @URL       PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = (req, res, next) => {
  res.json({ success: true, msg: 'Update bootcamp' });
}

// @desc      Delete bootcamps
// @URL       DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = (req, res, next) => {
  res.json({ success: true, msg: 'Delete bootcamp' });
}