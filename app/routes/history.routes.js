
const route = require("../controllers/history.controller.js");
const { authJwt } = require("../middleware");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept, Authorization"
        );
        next();
    });

    app.get(
        "/api/history",
        [authJwt.verifyTokenUser],
        route.history
    );

    app.get(
        "/api/historySwabber",
        [authJwt.verifyTokenSwabber],
        route.historySwabber
    );

};