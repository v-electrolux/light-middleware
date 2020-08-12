"use strict";

function asyncErrorHandler(routeHandler) {
    return function (req, res, next) {
        routeHandler(req, res, next).catch(next);
    };
}

module.exports = asyncErrorHandler;
