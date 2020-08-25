# light-middleware [![NPM version](https://badge.fury.io/js/light-middleware.svg)](https://badge.fury.io/js/light-middleware) [![Build Status](https://travis-ci.com/v-electrolux/light-middleware.svg?branch=master)](https://travis-ci.com/v-electrolux/light-middleware) [![Code Coverage](https://badgen.now.sh/codecov/c/github/v-electrolux/light-middleware)](https://badgen.now.sh/codecov/c/github/v-electrolux/light-middleware) [![install size](https://packagephobia.com/badge?p=light-middleware)](https://packagephobia.com/result?p=light-middleware)

A very tiny package (zero dependencies) that contains a bunch of most common middlewares, used in many micro-services

## Install

```shell script
$ npm install light-middleware
```

## Usage

- catchNotFoundError - middleware for throwing 404 error to user
- enableCors - middleware for enabling CORS requests to micro-service
- errorHandler - middleware for simple error handling
- expressBackwardCompatibility - middleware that adds method status and json (if you do not want use express module)
- logRequest - middleware for simple logging, you can use any logger module with log, error, info, fatal methods
- setStartRequestTimestamp - middleware that set starting time of request (for calculating duration for example)
- asyncErrorHandler - wraps async handler and converts it to classic express-handler style
- logWebSocketRequest - method for simple logging web socket connect/disconnect, you can use any logger, like in logRequest middleware

## Example

```javascript
// use logger module here, for example simple-node-logger
const snl = require("simple-node-logger");
const logger = snl.createSimpleLogger();

// use web framework, express for example
const express = require("express"); 
const app = express();

const MiddlewareManager = require("light-middleware");
const middlewareManager = new MiddlewareManager(logger , true, ["Custom-Cors-Header1", "Custom-Cors-Header2"]);

app.use(middlewareManager.catchNotFoundError);
app.use(middlewareManager.enableCors);
app.use(middlewareManager.errorHandler);
app.use(middlewareManager.expressBackwardCompatibility);
app.use(middlewareManager.logRequest);
app.use(middlewareManager.setStartRequestTimestamp);

const webSocketServer = new WebSocket.Server({noServer: true});
webSocketServer.on("connection", function (ws, req) {
    middlewareManager.logWebSocketRequest(req);
    ws.once("close", function (code, reason) {
        middlewareManager.logWebSocketRequest(req, code, reason);
    });
    
    // handle new client connection
});

// use as a wrapper for middleware handler
const testMiddlewareHandler = async function (req, res, next) {
    if (req.body) {
        next();
    } else {
        next(new Error("body not OK"));
    }
};
app.use(middlewareManager.asyncErrorHandler(testMiddlewareHandler));

// or as a wrapper for endpoint handler
const testEndpointHandler = async function (req, res, next) {
    if (req.body) {
        res.end("body OK");
    } else {
        throw new Error("body not OK");
    }
};
app.post("/test_handler", asyncErrorHandler(testEndpointHandler));
```
