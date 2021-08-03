const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

verifyTokenUser = (req, res, next) => {
    let token = req.headers["authorization"];
    if (!token) {
        return res.status(403).send({
            status: false,
            statusCode: 403,
            message: "No token provided!"
        });
    }

    jwt.verify(token, config.secretUser, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                status: false,
                statusCode: 401,
                message: "Unauthorized!"
            });
        }
        req.sessionIdUser = decoded.id;
        next();
    });
};

verifyTokenSwabber = (req, res, next) => {
    let token = req.headers["authorization"];
    if (!token) {
        return res.status(403).send({
            status: false,
            statusCode: 403,
            message: "No token provided!"
        });
    }

    jwt.verify(token, config.secretSwabber, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                status: false,
                statusCode: 401,
                message: "Unauthorized!"
            });
        }
        req.sessionIdUser = decoded.id;
        next();
    });
};

const authJwt = {
    verifyTokenUser: verifyTokenUser,
    verifyTokenSwabber: verifyTokenSwabber,
};
module.exports = authJwt;