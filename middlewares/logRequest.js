"use strict";
const util = require("util");
const requestIp = require("request-ip");

function createLogRequestMiddleware(logger) {
    function logRequest(req, res, next) {
        const end = res.end;
        res.end = function (chunk, encoding) {
            res.end = end;
            res.end(chunk, encoding);
            res.locals.end = Date.now();

            const method = req.method;
            const url = req.originalUrl || req.url;
            const clientIp = requestIp.getClientIp(req);
            const statusCode = res.statusCode;
            const duration = res.locals.end - res.locals.start;

            if (statusCode < 300) {
                const infoMessage = util.format("HTTP %s %s client_ip=%s %s %sms", method, url, clientIp, statusCode, duration);
                logger.info(infoMessage);
            } else {
                const requestBody = JSON.stringify(req.body);
                const responseBody = chunk ? chunk.toString() : "";
                const errorMessage = util.format("HTTP %s %s client_ip=%s %s %sms request_body=%s response_body=%s", method, url, clientIp, statusCode, duration, requestBody, responseBody);
                logger.error(errorMessage);
            }
        };
        next();
    }
    return logRequest;
}

module.exports = createLogRequestMiddleware;
