const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode || 500;
    if (res.statusCode === 200) {
        statusCode = 500;
    }
    console.log(err);
    return res.status(statusCode).json({
        success: false,
        message: err.message,
        stackTrace: err.stack,
    });
};

module.exports = errorHandler;
