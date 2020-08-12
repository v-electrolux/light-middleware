"use strict";

function expressBackwardCompatibility(req, res, next) {
    res.status = function (statusCode) {
        res.statusCode = statusCode;
        return res;
    };
    res.json = function (responseBody) {
        res.setHeader("Content-Type", "application/json");
        const responseBodyString = JSON.stringify(responseBody);
        const contentLength = Buffer.byteLength(responseBodyString);
        res.setHeader("Content-Length", contentLength);
        res.end(responseBodyString, "utf8");
        return res;
    };
    next();
}

module.exports = expressBackwardCompatibility;
