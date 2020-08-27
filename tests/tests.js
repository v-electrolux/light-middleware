const expect = require("chai").expect;
const MiddlewareManager = require("../index");

describe("MiddlewareManager", function () {

    describe("asyncErrorHandler", function () {

        it("should get error", function (done) {
            const middlewareManager = new MiddlewareManager();
            const reqStub = {};
            const resStub = {};
            let receivedError = null;
            const nextStub = function (err) {
                receivedError = err;
            };
            const asyncTestThrowHandler = async function (req, res) {
                throw new Error("big boom");
            };
            const syncTestThrowHandler = middlewareManager.asyncErrorHandler(asyncTestThrowHandler);
            syncTestThrowHandler(reqStub, resStub, nextStub);

            setImmediate(function () {
                expect(receivedError).to.be.an("error");
                expect(receivedError.message).to.be.equal("big boom");
                done();
            });
        });

        it("should get success result", function (done) {
            const middlewareManager = new MiddlewareManager();
            const sentReqStub = {};
            const sentResStub = {};
            let errorHandlerExecuted = false;
            const nextStub = function () {
                errorHandlerExecuted = true;
            };
            let receivedReqStub = null;
            let receivedResStub = null;
            const asyncTestSuccessHandler = async function (req, res) {
                receivedReqStub = req;
                receivedResStub = res;
            };
            const syncTestSuccessHandler = middlewareManager.asyncErrorHandler(asyncTestSuccessHandler);
            syncTestSuccessHandler(sentReqStub, sentResStub, nextStub);

            process.nextTick(function () {
                expect(errorHandlerExecuted).to.be.equal(false);
                expect(receivedReqStub).to.be.equal(sentReqStub);
                expect(receivedResStub).to.be.equal(sentResStub);
                done();
            });
        });

    });

    describe("catchNotFoundError", function () {

        it("should get error with next", function (done) {
            const middlewareManager = new MiddlewareManager();
            const reqStub = {};
            const resStub = {};
            let receivedErr = null;
            const nextStub = function (err) {
                receivedErr = err;
            };
            middlewareManager.catchNotFoundError(reqStub, resStub, nextStub);

            process.nextTick(function () {
                expect(receivedErr).to.be.an("error");
                expect(receivedErr.name).to.be.equal("HttpNotFoundError");
                expect(receivedErr.message).to.be.equal("Not found");
                expect(receivedErr.status).to.be.equal(404);
                done();
            });
        });

        it("should get error without next", function (done) {
            const errorMessages = [];
            const loggerStub = {
                error: msg => errorMessages.push(msg),
            };
            const middlewareManager = new MiddlewareManager(loggerStub, true);
            const reqStub = {};
            let receivedStatus = null;
            let receivedMessage = null;
            let endCalled = false;
            const resStub = {
                headersSent: false,
                status: (status) => {
                    receivedStatus = status;
                    return resStub;
                },
                json: (message) => {
                    receivedMessage = message;
                    return resStub;
                },
                end: _ => endCalled = true,
            };
            middlewareManager.catchNotFoundError(reqStub, resStub);

            process.nextTick(function () {
                expect(resStub.statusMessage).to.be.equal("HttpNotFoundError");
                expect(receivedStatus).to.be.equal(404);
                expect(receivedMessage).to.be.eql({ error: 'Not found' });
                expect(endCalled).to.be.equal(true);
                expect(errorMessages).to.have.length(1);
                expect(errorMessages[0]).to.be.equal("HttpNotFoundError: Not found");
                done();
            });
        });

    });

    describe("enableCors", function () {

        it("should set headers for OPTIONS request", function (done) {
            const middlewareManager = new MiddlewareManager();
            const reqStub = {
                method: "OPTIONS"
            };
            const receivedHeaders = {};
            let receivedStatus = null;
            let receivedMessage = null;
            const resStub = {
                setHeader: (name, value) => receivedHeaders[name] = value,
                status: status => {
                    receivedStatus = status;
                    return resStub;
                },
                end: msg => receivedMessage = msg,
            };
            let nextCalled = false;
            const nextStub = function () {
                nextCalled = true;
            };
            middlewareManager.enableCors(reqStub, resStub, nextStub);

            process.nextTick(function () {
                expect(receivedHeaders).to.have.property("Access-Control-Allow-Origin", "*");
                expect(receivedHeaders).to.have.property("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
                expect(receivedHeaders).to.have.property("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
                expect(receivedStatus).to.be.equal(200);
                expect(receivedMessage).to.be.equal("OK");
                expect(nextCalled).to.be.equal(false);
                done();
            });
        });

        it("should set additional headers for OPTIONS request", function (done) {
            const middlewareManager = new MiddlewareManager(undefined, undefined, ["Custom-Cors-Header"]);
            const reqStub = {
                method: "OPTIONS"
            };
            const receivedHeaders = {};
            let receivedStatus = null;
            let receivedMessage = null;
            const resStub = {
                setHeader: (name, value) => receivedHeaders[name] = value,
                status: status => {
                    receivedStatus = status;
                    return resStub;
                },
                end: msg => receivedMessage = msg,
            };
            let nextCalled = false;
            const nextStub = function () {
                nextCalled = true;
            };
            middlewareManager.enableCors(reqStub, resStub, nextStub);

            process.nextTick(function () {
                expect(receivedHeaders).to.have.property("Access-Control-Allow-Origin", "*");
                expect(receivedHeaders).to.have.property("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Custom-Cors-Header");
                expect(receivedHeaders).to.have.property("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
                expect(receivedStatus).to.be.equal(200);
                expect(receivedMessage).to.be.equal("OK");
                expect(nextCalled).to.be.equal(false);
                done();
            });
        });

        it("should set headers for GET request", function (done) {
            const middlewareManager = new MiddlewareManager();
            const reqStub = {
                method: "GET"
            };
            const receivedHeaders = {};
            let statusCalled = false;
            let endCalled = false;
            const resStub = {
                setHeader: (name, value) => receivedHeaders[name] = value,
                status: _ => {
                    statusCalled = true;
                    return resStub;
                },
                end: _ => endCalled = true,
            };
            let nextCalled = false;
            const nextStub = function () {
                nextCalled = true;
            };
            middlewareManager.enableCors(reqStub, resStub, nextStub);

            process.nextTick(function () {
                expect(receivedHeaders).to.have.property("Access-Control-Allow-Origin", "*");
                expect(receivedHeaders).to.have.property("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
                expect(receivedHeaders).to.have.property("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
                expect(statusCalled).to.be.equal(false);
                expect(endCalled).to.be.equal(false);
                expect(nextCalled).to.be.equal(true);
                done();
            });
        });

    });

    describe("errorHandler", function () {

        it("should forward error because headers are sent", function (done) {
            const errorMessages = [];
            const loggerStub = {
                error: msg => errorMessages.push(msg),
            };
            const middlewareManager = new MiddlewareManager(loggerStub, true);
            const reqStub = {};
            const resStub = {
                headersSent: true,
            };
            let receivedError = null;
            const nextStub = function (err) {
                receivedError = err;
            };
            const sentError = new Error("big boom");
            middlewareManager.errorHandler(sentError, reqStub, resStub, nextStub);

            process.nextTick(function () {
                expect(receivedError).to.be.equal(sentError);
                expect(errorMessages).to.have.length(1);
                expect(errorMessages[0]).to.be.equal("[headers sre sent] Error: big boom");
                done();
            });
        });

        it("should forward string error because headers are sent", function (done) {
            const errorMessages = [];
            const loggerStub = {
                error: msg => errorMessages.push(msg),
            };
            const middlewareManager = new MiddlewareManager(loggerStub, true);
            const reqStub = {};
            const resStub = {
                headersSent: true,
            };
            let receivedError = null;
            const nextStub = function (err) {
                receivedError = err;
            };
            const sentError = "big boom";
            middlewareManager.errorHandler(sentError, reqStub, resStub, nextStub);

            process.nextTick(function () {
                expect(receivedError).to.be.an("error");
                expect(receivedError.message).to.be.equal(sentError);
                expect(errorMessages).to.have.length(1);
                expect(errorMessages[0]).to.be.equal("[headers sre sent] big boom");
                done();
            });
        });

        it("should return error with status in no-debug mode", function (done) {
            const errorMessages = [];
            const loggerStub = {
                error: msg => errorMessages.push(msg),
            };
            const middlewareManager = new MiddlewareManager(loggerStub, false);
            const reqStub = {};
            let receivedStatus = null;
            let receivedMessage = null;
            let endCalled = false;
            const resStub = {
                headersSent: false,
                status: (status) => {
                    receivedStatus = status;
                    return resStub;
                },
                json: (message) => {
                    receivedMessage = message;
                    return resStub;
                },
                end: _ => endCalled = true,
            };
            let nextCalled = false;
            const nextStub = function () {
                nextCalled = true;
            };
            const sentError = new Error("not auth");
            sentError.status = 401;
            middlewareManager.errorHandler(sentError, reqStub, resStub, nextStub);

            process.nextTick(function () {
                expect(nextCalled).to.be.equal(false);
                expect(resStub.statusMessage).to.be.equal(undefined);
                expect(receivedStatus).to.be.equal(401);
                expect(receivedMessage).to.be.eql({});
                expect(endCalled).to.be.equal(true);
                expect(errorMessages).to.have.length(1);
                expect(errorMessages[0]).to.be.equal("Error: not auth");
                done();
            });
        });

        it("should return error without status in no-debug mode", function (done) {
            const errorMessages = [];
            const loggerStub = {
                error: msg => errorMessages.push(msg),
            };
            const middlewareManager = new MiddlewareManager(loggerStub, false);
            const reqStub = {};
            let receivedStatus = null;
            let receivedMessage = null;
            let endCalled = false;
            const resStub = {
                headersSent: false,
                status: (status) => {
                    receivedStatus = status;
                    return resStub;
                },
                json: (message) => {
                    receivedMessage = message;
                    return resStub;
                },
                end: _ => endCalled = true,
            };
            let nextCalled = false;
            const nextStub = function () {
                nextCalled = true;
            };
            const sentError = new Error("not auth");
            middlewareManager.errorHandler(sentError, reqStub, resStub, nextStub);

            process.nextTick(function () {
                expect(nextCalled).to.be.equal(false);
                expect(resStub.statusMessage).to.be.equal(undefined);
                expect(receivedStatus).to.be.equal(500);
                expect(receivedMessage).to.be.eql({});
                expect(endCalled).to.be.equal(true);
                expect(errorMessages).to.have.length(1);
                expect(errorMessages[0]).to.be.equal("Error: not auth");
                done();
            });
        });

        it("should return error with status message in debug mode", function (done) {
            const errorMessages = [];
            const loggerStub = {
                error: msg => errorMessages.push(msg),
            };
            const middlewareManager = new MiddlewareManager(loggerStub, true);
            const reqStub = {};
            let receivedStatus = null;
            let receivedMessage = null;
            let endCalled = false;
            const resStub = {
                headersSent: false,
                status: (status) => {
                    receivedStatus = status;
                    return resStub;
                },
                json: (message) => {
                    receivedMessage = message;
                    return resStub;
                },
                end: _ => endCalled = true,
            };
            let nextCalled = false;
            const nextStub = function () {
                nextCalled = true;
            };
            const sentError = new Error("not auth");
            sentError.status = 401;
            sentError.statusMessage = "Auth needed";
            middlewareManager.errorHandler(sentError, reqStub, resStub, nextStub);

            process.nextTick(function () {
                expect(nextCalled).to.be.equal(false);
                expect(resStub.statusMessage).to.be.equal("Auth needed");
                expect(receivedStatus).to.be.equal(401);
                expect(receivedMessage).to.be.eql({ error: "not auth" });
                expect(endCalled).to.be.equal(true);
                expect(errorMessages).to.have.length(1);
                expect(errorMessages[0]).to.be.equal("Error: not auth");
                done();
            });
        });

        it("should return error without status message in debug mode", function (done) {
            const errorMessages = [];
            const loggerStub = {
                error: msg => errorMessages.push(msg),
            };
            const middlewareManager = new MiddlewareManager(loggerStub, true);
            const reqStub = {};
            let receivedStatus = null;
            let receivedMessage = null;
            let endCalled = false;
            const resStub = {
                headersSent: false,
                status: (status) => {
                    receivedStatus = status;
                    return resStub;
                },
                json: (message) => {
                    receivedMessage = message;
                    return resStub;
                },
                end: _ => endCalled = true,
            };
            let nextCalled = false;
            const nextStub = function () {
                nextCalled = true;
            };
            const sentError = new Error("not auth");
            sentError.status = 401;
            middlewareManager.errorHandler(sentError, reqStub, resStub, nextStub);

            process.nextTick(function () {
                expect(nextCalled).to.be.equal(false);
                expect(resStub.statusMessage).to.be.equal("Error");
                expect(receivedStatus).to.be.equal(401);
                expect(receivedMessage).to.be.eql({ error: "not auth" });
                expect(endCalled).to.be.equal(true);
                expect(errorMessages).to.have.length(1);
                expect(errorMessages[0]).to.be.equal("Error: not auth");
                done();
            });
        });

    });

    describe("expressBackwardCompatibility", function () {

        it("should set methods for res", function (done) {
        const middlewareManager = new MiddlewareManager();
        const jsonBody = {result: 1};
        const reqStub = {};
        const receivedHeaders = {};
        let receivedMessage = null;
        let receivedEncoding = null;
        const resStub = {
            setHeader: (name, value) => receivedHeaders[name] = value,
            end: (message, encoding) => {
                receivedMessage = message;
                receivedEncoding = encoding;
            },
        };
        let nextCalled = false;
        const nextStub = function () {
            nextCalled = true;
        };
        middlewareManager.expressBackwardCompatibility(reqStub, resStub, nextStub);

        process.nextTick(function () {
            expect(resStub).to.have.property("status").that.is.a("function");
            expect(resStub.statusCode).to.be.equal(undefined);
            expect(resStub.status(200)).to.be.equal(resStub);
            expect(resStub.statusCode).to.be.equal(200);

            expect(resStub).to.have.property("json").that.is.a("function");
            expect(receivedHeaders).not.to.have.property("Content-Type");
            expect(receivedHeaders).not.to.have.property("Content-Length");
            expect(resStub.json(jsonBody)).to.be.equal(resStub);
            expect(receivedHeaders).to.have.property("Content-Type", "application/json; charset=utf-8");
            expect(receivedHeaders).to.have.property("Content-Length", 12);
            expect(receivedMessage).to.be.equal("{\"result\":1}");
            expect(receivedEncoding).to.be.equal("utf8");

            expect(nextCalled).to.be.equal(true);
            done();
        });
    });

    });

    describe("logRequest", function () {

        it("should log successful request", function (done) {
            const infoMessages = [];
            const errorMessages = [];
            const loggerStub = {
                info: msg => infoMessages.push(msg),
                error: msg => errorMessages.push(msg),
            };
            const middlewareManager = new MiddlewareManager(loggerStub);
            const reqStub = {
                url: "/test/method",
                method: "POST",
                headers: {
                    "x-client-ip": "127.0.0.1"
                },
                body: {
                    request: "body"
                },
            };
            let receivedMessage = null;
            let receivedEncoding = null;
            const resStub = {
                locals: {
                    start: 1597234999800,
                },
                statusCode: 200,
                end: (msg, encoding) => {
                    receivedMessage = msg;
                    receivedEncoding = encoding;
                },
            };
            let nextCalled = false;
            const nextStub = function () {
                nextCalled = true;
            };
            middlewareManager.logRequest(reqStub, resStub, nextStub);

            process.nextTick(function () {
                expect(nextCalled).to.be.equal(true);

                expect(receivedMessage).to.be.equal(null);
                expect(receivedEncoding).to.be.equal(null);
                expect(infoMessages).to.have.length(0);
                expect(errorMessages).to.have.length(0);
                resStub.end("{\"result\": 1}", "utf8");
                expect(receivedMessage).to.be.equal("{\"result\": 1}");
                expect(receivedEncoding).to.be.equal("utf8");
                expect(infoMessages).to.have.length(1);
                let infoMsg = infoMessages[0];
                expect(infoMsg).to.include("HTTP POST /test/method client_ip=127.0.0.1 200 ");
                infoMsg = infoMsg.replace("HTTP POST /test/method client_ip=127.0.0.1 200 ", "");
                expect(infoMsg).to.include("ms");
                infoMsg = infoMsg.replace("ms", "");
                expect(infoMsg).to.match(/[1234567890]*/);
                const duration = parseInt(infoMsg);
                expect(duration).to.be.within(2170122, Date.now() - resStub.locals.start);
                expect(errorMessages).to.have.length(0);

                done();
            });
        });

        it("should log failed request", function (done) {
            const infoMessages = [];
            const errorMessages = [];
            const loggerStub = {
                info: msg => infoMessages.push(msg),
                error: msg => errorMessages.push(msg),
            };
            const middlewareManager = new MiddlewareManager(loggerStub);
            const reqStub = {
                url: "/test/method",
                method: "POST",
                headers: {
                    "x-client-ip": "127.0.0.1"
                },
                body: {
                    request: "body"
                },
            };
            let receivedMessage = null;
            let receivedEncoding = null;
            const resStub = {
                locals: {
                    start: 1597234999800,
                },
                statusCode: 400,
                end: (msg, encoding) => {
                    receivedMessage = msg;
                    receivedEncoding = encoding;
                },
            };
            let nextCalled = false;
            const nextStub = function () {
                nextCalled = true;
            };
            middlewareManager.logRequest(reqStub, resStub, nextStub);

            process.nextTick(function () {
                expect(nextCalled).to.be.equal(true);

                expect(receivedMessage).to.be.equal(null);
                expect(receivedEncoding).to.be.equal(null);
                expect(infoMessages).to.have.length(0);
                expect(errorMessages).to.have.length(0);
                resStub.end("{\"result\": 1}", "utf8");
                expect(receivedMessage).to.be.equal("{\"result\": 1}");
                expect(receivedEncoding).to.be.equal("utf8");
                expect(errorMessages).to.have.length(1);
                let errorMsg = errorMessages[0];
                expect(errorMsg).to.include("HTTP POST /test/method client_ip=127.0.0.1 400 ");
                errorMsg = errorMsg.replace("HTTP POST /test/method client_ip=127.0.0.1 400 ", "");
                expect(errorMsg).to.include("ms request_body={\"request\":\"body\"} response_body={\"result\": 1}");
                errorMsg = errorMsg.replace("ms request_body={\"request\":\"body\"} response_body={\"result\": 1}", "");
                expect(errorMsg).to.match(/^[0-9]*$/);
                const duration = parseInt(errorMsg);
                expect(duration).to.be.within(2170122, Date.now() - resStub.locals.start);
                expect(infoMessages).to.have.length(0);

                done();
            });
        });

    });

    describe("logWebSocketRequest", function () {

        it("should log web socket connect", function (done) {
            const infoMessages = [];
            const errorMessages = [];
            const loggerStub = {
                info: msg => infoMessages.push(msg),
                error: msg => errorMessages.push(msg),
            };
            const middlewareManager = new MiddlewareManager(loggerStub);
            const reqStub = {
                url: "/subscribe/new",
                method: "GET",
                headers: {
                    "x-client-ip": "127.0.0.1"
                },
            };
            middlewareManager.logWebSocketRequest(reqStub);

            process.nextTick(function () {
                expect(errorMessages).to.have.length(0);
                expect(infoMessages).to.have.length(1);
                let infoMsg = infoMessages[0];
                expect(infoMsg).to.be.equal("WS GET /subscribe/new client_ip=127.0.0.1");
                done();
            });
        });

        it("should log web socket successful disconnect", function (done) {
            const infoMessages = [];
            const errorMessages = [];
            const loggerStub = {
                info: msg => infoMessages.push(msg),
                error: msg => errorMessages.push(msg),
            };
            const middlewareManager = new MiddlewareManager(loggerStub);
            const reqStub = {
                url: "/subscribe/new",
                method: "GET",
                headers: {
                    "x-client-ip": "127.0.0.1"
                },
            };
            middlewareManager.logWebSocketRequest(reqStub, 1005, "No status sent");

            process.nextTick(function () {
                expect(errorMessages).to.have.length(0);
                expect(infoMessages).to.have.length(1);
                let infoMsg = infoMessages[0];
                expect(infoMsg).to.be.equal("WS GET /subscribe/new client_ip=127.0.0.1 close_code=1005 reason=No status sent");
                done();
            });
        });

        it("should log web socket 404", function (done) {
            const infoMessages = [];
            const errorMessages = [];
            const loggerStub = {
                info: msg => infoMessages.push(msg),
                error: msg => errorMessages.push(msg),
            };
            const middlewareManager = new MiddlewareManager(loggerStub);
            const reqStub = {
                url: "/subscribe/not_exist",
                method: "GET",
                headers: {
                    "x-client-ip": "127.0.0.1"
                },
                statusCode: 404,
            };
            middlewareManager.logWebSocketRequest(reqStub);

            process.nextTick(function () {
                expect(errorMessages).to.have.length(0);
                expect(infoMessages).to.have.length(1);
                let infoMsg = infoMessages[0];
                expect(infoMsg).to.be.equal("WS GET /subscribe/not_exist 404 client_ip=127.0.0.1");
                done();
            });
        });

        it("should log web socket abnormal disconnect", function (done) {
            const infoMessages = [];
            const errorMessages = [];
            const loggerStub = {
                info: msg => infoMessages.push(msg),
                error: msg => errorMessages.push(msg),
            };
            const middlewareManager = new MiddlewareManager(loggerStub);
            const reqStub = {
                url: "/subscribe/new",
                method: "GET",
                headers: {
                    "x-client-ip": "127.0.0.1"
                },
            };
            middlewareManager.logWebSocketRequest(reqStub, 1006, "No close code frame has been receieved");

            process.nextTick(function () {
                expect(infoMessages).to.have.length(0);
                expect(errorMessages).to.have.length(1);
                let errorMsg = errorMessages[0];
                expect(errorMsg).to.be.equal("WS GET /subscribe/new client_ip=127.0.0.1 close_code=1006 reason=No close code frame has been receieved");
                done();
            });
        });

    });

    describe("setStartRequestTimestamp", function () {

        it("should set start time", function (done) {
            const middlewareManager = new MiddlewareManager();
            const startTimestamp = Date.now();
            const reqStub = {};
            const resStub = {};
            let nextCalled = false;
            const nextStub = function () {
                nextCalled = true;
            };
            middlewareManager.setStartRequestTimestamp(reqStub, resStub, nextStub);

            process.nextTick(function () {
                expect(resStub).to.have.nested.property("locals.start").that.is.a("number").within(startTimestamp, Date.now());
                expect(nextCalled).to.be.equal(true);
                done();
            });
        });

    });
});
