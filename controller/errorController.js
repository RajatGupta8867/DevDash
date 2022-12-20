// Global Error Handeling Middleware

const AppError = require("../utils/appError");

// const handleDublicaeDB = (err) => {
//     const value=err.errmsg.match(/(["'"])(\\?.)*?\1/);
//   const message = `Duplicate Field value:${value},Pleaase use another value.`;
//   return new AppError(message,400)
// };

module.exports = (err, req, res, next) => {
//   let error = { ...err };
//   if (error.code === 11000) {
//     handleDublicaeDB(error);
//   }
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error..';
  res.status(err.statusCode).json({
    status: err.status,
    error:err,
    message: err.message,
    stack:err.stack
  });
};
