"use strict";
const asyncErrorHandler = require("./middlewares/asyncErrorHandler");
const createCatchNotFoundErrorMiddleware = require("./middlewares/catchNotFoundError");
const createEnableCorsMiddleware = require("./middlewares/enableCors");
const createErrorHandlerMiddleware = require("./middlewares/errorHandler");
const expressBackwardCompatibility = require("./middlewares/expressBackwardCompatibility");
const createLogRequestMiddleware = require("./middlewares/logRequest");
const createLogWebSocketRequestMiddleware = require("./middlewares/logWebSocketRequest");
const setStartRequestTimestamp = require("./middlewares/setStartRequestTimestamp");

class MiddlewareManager {
    constructor(logger, debug, allowAdditionalHeadersForCors) {
        const errorHandler = createErrorHandlerMiddleware(logger, debug);

        this.asyncErrorHandler = asyncErrorHandler;
        this.catchNotFoundError = createCatchNotFoundErrorMiddleware(errorHandler);
        this.enableCors = createEnableCorsMiddleware(allowAdditionalHeadersForCors);
        this.errorHandler = errorHandler;
        this.expressBackwardCompatibility = expressBackwardCompatibility;
        this.logRequest = createLogRequestMiddleware(logger);
        this.logWebSocketRequest = createLogWebSocketRequestMiddleware(logger);
        this.setStartRequestTimestamp = setStartRequestTimestamp;
    }
}

module.exports = MiddlewareManager;
