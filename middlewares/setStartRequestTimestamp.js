"use strict";

function setStartRequestTimestamp(req, res, next) {
    if (!res.locals) {
        res.locals = {};
    }
    res.locals.start = Date.now();
    next();
}

module.exports = setStartRequestTimestamp;
