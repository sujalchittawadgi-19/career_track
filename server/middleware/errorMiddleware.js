const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  console.error('[SERVER ERROR]', err);

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Multer limits
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'Uploaded file exceeds the maximum allowed limit of 5 MB.';
  }

  // Handle PostgreSQL foreign key or unique constraint errors
  if (err.code === '23505') {
    statusCode = 409;
    message = 'A duplicate record already exists.';
  } else if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced related record does not exist or cannot be modified.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
