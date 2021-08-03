
const route = require("../controllers/menu.controller.js");
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
        "/api/menus",
        [authJwt.verifyTokenUser],
        route.findAll
    );

    app.post(
        "/api/getListSwabbers",
        [authJwt.verifyTokenUser],
        route.getListSwabbers
    );
};