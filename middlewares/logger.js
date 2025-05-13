// Custom Logger Middleware with Morgan Module
const morgan = require("morgan");


const logger = (req, res, next) => {
  
  const morganLogger = morgan("dev");

  morganLogger(req, res, next);
};

module.exports = logger;
