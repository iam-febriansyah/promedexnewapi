const { verifySignUp } = require("../middleware");
const userAuth = require("../controllers/auths/authuser.controller.js");
const fcm = require("../controllers/auths/fcm.controller.js");
const swabberAuth = require("../controllers/auths/authswabber.controller.js");
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
        "/api/auth/signup",
        [
            verifySignUp.checkDuplicateUsernameOrEmailUser,
        ],
        userAuth.signup
    );
    app.post(
        "/api/swabber/signup",
        [
            verifySignUp.checkDuplicateUsernameOrEmailSwabber,
        ],
        swabberAuth.signup
    );

    app.post("/api/auth/signin", userAuth.signin);
    app.post("/api/swabber/signin", swabberAuth.signin);

    app.post("/api/updateTokenFcm",
        [authJwt.verifyTokenUser],
        fcm.updateTokenFCM);
    app.post("/api/swabber/updateTokenFcm",
        [authJwt.verifyTokenSwabber],
        fcm.updateTokenFCM);
};
