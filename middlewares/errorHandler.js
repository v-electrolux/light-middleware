"use strict";

function createErrorHandlerMiddleware(logger, debug) {
    function errorHandler(err, req, res, next) {
        const messageForLogger = res.headersSent
            ? "[headers sre sent] " + err.toString()
            : err.toString();
        logger.error(messageForLogger);
        if (!(err instanceof Error)) {
            err = new Error(err.toString());
        }

        if (res.headersSent) {
            next(err);
        } else {
            const status = ("status" in err)
                ? err.status
                : 500;
            if (debug) {
                res.statusMessage = ("statusMessage" in err)
                    ? err.statusMessage
                    : err.name;
            }
            const message = debug ? {error: err.message} : {};

            res.status(status).json(message).end();
        }
    }
    return errorHandler;
}

module.exports = createErrorHandlerMiddleware;
