"use strict";

function createCatchNotFoundErrorMiddleware(errorHandler) {
    function catchNotFoundError(req, res, next) {
        const err = new HttpNotFoundError();
        if (next) {
            next(err);
        } else {
            errorHandler(err, req, res);
        }
    }
    return catchNotFoundError;
}

class HttpNotFoundError extends Error {
    constructor() {
        super("Not found");
        this.name = this.constructor.name;
        this.status = 404;
    }
}

module.exports = createCatchNotFoundErrorMiddleware;
