"use strict";
const asyncErrorHandler = require("./middlewares/asyncErrorHandler");
const catchNotFoundError = require("./middlewares/catchNotFoundError");
const enableCors = require("./middlewares/enableCors");
const createErrorHandlerMiddleware = require("./middlewares/errorHandler");
const expressBackwardCompatibility = require("./middlewares/expressBackwardCompatibility");
const createLogRequestMiddleware = require("./middlewares/logRequest");
const setStartRequestTimestamp = require("./middlewares/setStartRequestTimestamp");

class MiddlewareManager {
    constructor(logger, debug) {
        this.asyncErrorHandler = asyncErrorHandler;
        this.catchNotFoundError = catchNotFoundError;
        this.enableCors = enableCors;
        this.errorHandler = createErrorHandlerMiddleware(logger, debug);
        this.expressBackwardCompatibility = expressBackwardCompatibility;
        this.logRequest = createLogRequestMiddleware(logger);
        this.setStartRequestTimestamp = setStartRequestTimestamp;
    }
}

module.exports = MiddlewareManager;
