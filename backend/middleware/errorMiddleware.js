const errorHandler = (err, req, res, next) => {
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: err.errors.map((e) => e.message),
    });
  }
  res.status(500).json({ message: err.message || "Server Error" });
};

export default errorHandler;
