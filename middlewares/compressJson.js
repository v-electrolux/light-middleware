"use strict";
const snappyjs = require("snappyjs");

function compressJson(req, res, next) {
    res.compressJson = function (responseBody) {
        res.setHeader("Content-Type", "application/octet-stream");
        const responseBodyString = JSON.stringify(responseBody);
        const contentLength = Buffer.byteLength(responseBodyString);
        res.setHeader("Content-Length", contentLength);
        const responseBuffer = Buffer.from(responseBodyString);
        const compressedResponse = snappyjs.compress(responseBuffer);
        res.end(compressedResponse);
        return res;
    };
    next();
}

module.exports = compressJson;
