const db = require("../models");
const User = db.user;

checkDuplicateUsernameOrEmailUser = (req, res, next) => {
    // Username
    User.findOne({
        where: {
            username: req.body.username,
            level: 1
        }
    }).then(user => {
        if (user) {
            res.status(400).send({
                status: false,
                message: "Failed! Username is already in use!"
            });
            return;
        }

        // Email
        User.findOne({
            where: {
                email: req.body.email,
                level: 1
            }
        }).then(user => {
            if (user) {
                res.status(400).send({
                    status: false,
                    message: "Failed! Email is already in use!"
                });
                return;
            }

            next();
        });
    });
};

checkDuplicateUsernameOrEmailSwabber = (req, res, next) => {
    // Username
    User.findOne({
        where: {
            username: req.body.username,
            level: 2
        }
    }).then(user => {
        if (user) {
            res.status(400).send({
                status: false,
                message: "Failed! Username is already in use!"
            });
            return;
        }

        // Email
        User.findOne({
            where: {
                email: req.body.email,
                level: 2
            }
        }).then(user => {
            if (user) {
                res.status(400).send({
                    status: false,
                    message: "Failed! Email is already in use!"
                });
                return;
            }

            next();
        });
    });
};

const verifySignUp = {
    checkDuplicateUsernameOrEmailUser: checkDuplicateUsernameOrEmailUser,
    checkDuplicateUsernameOrEmailSwabber: checkDuplicateUsernameOrEmailSwabber,
};

module.exports = verifySignUp;