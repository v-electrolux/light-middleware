"use strict";
const util = require("util");
const requestIp = require("request-ip");

const WsCloseCodes = {
    CLOSE_NORMAL: 1000,
    CLOSE_GOING_AWAY: 1001,
    CLOSED_NO_STATUS: 1005,
}

function createLogWebSocketRequestMiddleware(logger) {
    function logWebSocketRequest(req, code, reason) {
        const method = req.method;
        const url = req.url;
        const clientIp = requestIp.getClientIp(req);
        const statusCode = req.statusCode;

        if (!code) {
            const infoMessage = util.format("WS %s %s%s client_ip=%s",
                method,
                url,
                statusCode ? " " + statusCode : "",
                clientIp,
            );
            logger.info(infoMessage);
        } else {
            const message = util.format("WS %s %s%s client_ip=%s close_code=%s%s",
                method,
                url,
                statusCode ? " " + statusCode : "",
                clientIp,
                code,
                reason ? " reason=" + reason : "",
            );

            if ((code === WsCloseCodes.CLOSE_NORMAL) ||
                (code === WsCloseCodes.CLOSE_GOING_AWAY) ||
                (code === WsCloseCodes.CLOSED_NO_STATUS)) {
                logger.info(message);
            } else {
                logger.error(message);
            }
        }
    }
    return logWebSocketRequest;
}

module.exports = createLogWebSocketRequestMiddleware;
