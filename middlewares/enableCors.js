"use strict";

function createEnableCorsMiddleware(allowAdditionalHeadersForCors) {
    const allowHeadersForCors =[
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
    ];
    if (allowAdditionalHeadersForCors) {
        allowHeadersForCors.push(...allowAdditionalHeadersForCors);
    }
    const headersForCorsString = allowHeadersForCors.join(", ");
    function enableCors(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", headersForCorsString);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");

        if (req.method !== "OPTIONS") {
            next();
        } else {
            res.status(200).end("OK");
        }
    }
    return enableCors;
}

module.exports = createEnableCorsMiddleware;
