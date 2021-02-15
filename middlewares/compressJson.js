"use strict";
const snappyjs = require("snappyjs");

function compressJson(req, res, next) {
    res.compressJson = function (responseBody) {
        res.setHeader("Content-Type", "application/octet-stream");
        const responseBodyString = JSON.stringify(responseBody);
        const responseBuffer = Buffer.from(responseBodyString);
        const compressedResponse = snappyjs.compress(responseBuffer);
        const contentLength = Buffer.byteLength(compressedResponse);
        res.setHeader("Content-Length", contentLength);
        res.end(compressedResponse);
        return res;
    };
    next();
}

module.exports = compressJson;
