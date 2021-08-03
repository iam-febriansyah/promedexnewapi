
const route = require("../controllers/transaction.controller.js");
const { authJwt } = require("../middleware");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept, Authorization"
        );
        next();
    });

    app.post(
        "/api/transaction",
        [authJwt.verifyTokenUser],
        route.transaction
    );

    app.post(
        "/api/statusHomecare",
        [authJwt.verifyTokenUser],
        route.statusHomecare
    );

    app.post("/api/callback/speedpay",
        route.callbackSpeedpay);
};