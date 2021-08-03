const db = require("../../models");
const User = db.user;
const Op = db.Sequelize.Op;
var getIP = require('ipware')().get_ip;
var dateFormat = require('dateformat');

exports.updateTokenFCM = async (req, res) => {
    var ipInfo = getIP(req);
    var idUser = req.sessionIdUser;
    var dateNow = dateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");
    try {
        if (typeof req.body.token === 'undefined') {
            throw new Error("token not found in body request");
        }
        if (req.body.token === "") {
            throw new Error("token is required");
        }
        var token_fcm = req.body.token;
        var resUser = await User.findOne({
            where: { id: idUser }
        })
            .then(async responseUser => {
                if (!responseUser) {
                    responseTemp = {
                        status: true,
                        message: "User Not found.",
                        statusCode: 404
                    }
                } else {
                    let values = {
                        fcm_token: token_fcm,
                        fcm_last_update: dateNow,
                        updated_at: dateNow,
                        updated_by: JSON.stringify(ipInfo)
                    }
                    const result = await User.update(values, {
                        where: { id: idUser }
                    });
                    if (result) {
                        responseTemp = {
                            status: true,
                            message: "Successfully update token",
                            statusCode: 200
                        }
                    } else {
                        responseTemp = {
                            status: false,
                            message: JSON.stringify(result),
                            statusCode: 500
                        }
                    }
                }
                return responseTemp;

            })
            .catch(err => {
                responseTemp = {
                    status: false,
                    message: err.message,
                    statusCode: 500
                }
                return responseTemp;
            });
        res.status(resUser.statusCode).send(resUser);
    } catch (e) {
        res.status(500).send({ status: false, statusCode: 500, message: e.message });
    }
};



