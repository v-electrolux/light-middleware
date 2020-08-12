"use strict";

function catchNotFoundError(req, res, next) {
    next(new HttpNotFoundError());
}

class HttpNotFoundError extends Error {
    constructor() {
        super("Not found");
        this.name = this.constructor.name;
        this.status = 404;
    }
}

module.exports = catchNotFoundError;
