"use strict";

const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const UserDetail = db.userdetail;

module.exports.status = function status(input) {
    let statusData;
    switch (input) {
        case 1:
            statusData = "On Request";
            break;
        case 2:
            statusData = "Pending Payment";
            break;
        case 3:
            statusData = "Reject";
            break;
        case 4:
            statusData = "Cancel";
            break;
        case 5:
            statusData = "Payment Success, Swabber On The Way";
            break;
        case 6:
            statusData = "Proccess Swab";
            break;
        case 7:
            statusData = "Sample Check";
            break;
        case 7:
            statusData = "Done";
            break;
        default:
            statusData = "On Request";
    }
    return statusData;
}

module.exports.getSessionUser = async function getSessionUser(idUser) {
    var resUser = await User.findOne({
        where: { id: idUser },
        include: [
            {
                model: UserDetail,
                required: true
            }
        ]
    })
        .then(user => {
            if (!user) {
                responseTemp = {
                    status: true,
                    message: "User Not found.",
                    statusCode: 404
                }
            } else {
                responseTemp = {
                    status: true,
                    statusCode: 200,
                    message: "Successfully",
                    accessToken: token,
                    dataUser: user
                }
            }
            return responseTemp;

        })
        .catch(err => {
            responseTemp = {
                status: true,
                message: err.message,
                statusCode: 500
            }
        });

    dataUsers = {
        id: resUser.dataUser.id,
        username: resUser.dataUser.username,
        email: resUser.dataUser.email,
        level: resUser.dataUser.level,
        fcmTokem: resUser.fcm_token,
        fcmLastUpdate: resUser.fcm_last_update,

        iddetail: resUser.dataUser.userdetail.id,
        identityNumber: resUser.dataUser.userdetail.identityNumber,
        identityParentNumber: resUser.dataUser.userdetail.identityParentNumber,
        name: resUser.dataUser.userdetail.name,
        gender: resUser.dataUser.userdetail.gender,
        birthDay: resUser.dataUser.userdetail.birthDay,
        birthPlace: resUser.dataUser.userdetail.birthPlace,
        phone: resUser.dataUser.userdetail.phone,
        address: resUser.dataUser.userdetail.address,
        nationality: resUser.dataUser.userdetail.nationality,
    }
    response = {
        status: true,
        statusCode: resUser.statusCode,
        message: resUser.message,
        accessToken: resUser.statusCode == 200 ? resUser.accessToken : null,
        dataUser: dataUsers
    }
    return response;
}