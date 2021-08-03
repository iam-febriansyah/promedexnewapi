
const route = require("../controllers/swabber.controller.js");
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
        "/api/swabber/setOnlineOffline",
        [authJwt.verifyTokenSwabber],
        route.setOnlineOffline
    );

    app.post(
        "/api/swabber/confirmation",
        [authJwt.verifyTokenSwabber],
        route.confirmation
    );

    app.post(
        "/api/swabber/setNewLocation",
        [authJwt.verifyTokenSwabber],
        route.setNewLocation
    );
};