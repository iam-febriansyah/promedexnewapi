const db = require("../models");
const speedpay = require("../config/speedpay.config.js");
const Registration = db.registration;
const Payment = db.payment;
const Reservation = db.reservation;
const User = db.user;
const UserSwab = db.userswab;
const UserLocation = db.userlocation;
const Op = db.Sequelize.Op;
const request = require('request');
var dateFormat = require('dateformat');
var getIP = require('ipware')().get_ip;
const { generalFunction, api } = require("../middleware");

exports.setOnlineOffline = async (req, res) => {
    var ipInfo = getIP(req);
    var idUser = req.sessionIdUser;
    var dateNow = dateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");
    try {
        errorHanlde = validationBodySetOnlineOffline(req);
        if (errorHanlde.status) {
            throw new Error(errorHanlde.error);
        }
        var online = req.body.online;
        var resUserSwab = await UserSwab.findOne({
            where: { iduser: idUser }
        })
            .then(async responseUserSwab => {
                if (!responseUserSwab) {
                    responseTemp = {
                        status: true,
                        message: "User Swab Not found.",
                        statusCode: 404
                    }
                } else {
                    let values = {
                        online: online,
                        updated_at: dateNow,
                        updated_by: JSON.stringify(ipInfo)
                    }
                    const result = await UserSwab.update(values, {
                        where: { iduser: idUser }
                    });
                    if (result) {
                        if (online) {
                            online = "Online";
                        } else {
                            online = "Offline";
                        }
                        responseTemp = {
                            status: true,
                            message: "Successfully update to " + online,
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
        res.status(resUserSwab.statusCode).send(resUserSwab);
    } catch (e) {
        res.status(500).send({ status: false, statusCode: 500, message: e.message });
    }
};

exports.confirmation = async (req, res) => {
    var ipInfo = getIP(req);
    var idUser = req.sessionIdUser;
    var dateNow = dateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");
    try {
        errorHanlde = validationBodyConfirmation(req);
        if (errorHanlde.status) {
            throw new Error(errorHanlde.error);
        }
        var invoiceNumber = req.body.invoiceNumber;
        var confirmation = req.body.confirmation;
        var remarks = req.body.remarks;

        var resReservation = await Reservation.findOne({
            where: { invoiceNumber: invoiceNumber, status: 1 }
        })
            .then(async responseReservation => {
                if (!responseReservation) {
                    responseTemp = {
                        status: false,
                        message: "Reservation Not found.",
                        statusCode: 404
                    }
                } else {
                    let values = {
                        idSwabber: idUser,
                        status: confirmation ? 2 : 3,
                        remarks: remarks,
                        updated_at: dateNow,
                        updated_by: JSON.stringify(ipInfo)
                    }
                    const result = await Reservation.update(values, {
                        where: {
                            invoiceNumber: invoiceNumber
                        }
                    });
                    if (result) {
                        if (confirmation) {
                            var transaction_details = new Array();
                            var transactions = {
                                bank: responseReservation.bank,
                                order_id: invoiceNumber,
                                gross_amount: responseReservation.price,
                                customer_email: responseReservation.customerName,
                                customer_name: responseReservation.customerEmail,
                                customer_phone: responseReservation.customerPhone,
                                expired: 2, //DALAM SATUAN JAM 
                            }

                            var resReg = await getRegistrations(invoiceNumber);
                            if (resReg.status) {
                                totalPrice = 0;
                                reg = resReg.data;
                                for (i = 0; i < reg.length; i++) {
                                    transaction_details[i] = {};
                                    transaction_details[i]["clientId"] = reg[i].clientId;
                                    transaction_details[i]["invoiceNumber"] = invoiceNumber;
                                    transaction_details[i]["identityNumber"] = reg[i].identityNumber;
                                    transaction_details[i]["identityParentNumber"] = reg[i].identityParentNumber;
                                    transaction_details[i]["name"] = reg[i].name;
                                    transaction_details[i]["gender"] = reg[i].gender;
                                    transaction_details[i]["birthDay"] = reg[i].birthDay;
                                    transaction_details[i]["birthPlace"] = reg[i].birthPlace;
                                    transaction_details[i]["nationality"] = reg[i].nationality;
                                    transaction_details[i]["address"] = reg[i].address;
                                    transaction_details[i]["phone"] = reg[i].phone;
                                    transaction_details[i]["email"] = reg[i].email;
                                    transaction_details[i]["serviceClientId"] = reg[i].serviceClientId;
                                    transaction_details[i]["price"] = reg[i].price;
                                    transaction_details[i]["orderType"] = reg[i].orderType;
                                    transaction_details[i]["dateReservation"] = reg[i].dateReservation;
                                    transaction_details[i]["hourReservation"] = reg[i].hourReservation;
                                    transaction_details[i]["created_by"] = JSON.stringify(ipInfo);
                                    clientId = reg[i].clientId;
                                    totalPrice += reg[i].price;
                                }

                                dataToSpeedpay = {
                                    transaction: transactions,
                                    transaction_details: transaction_details
                                }

                                resSpeed = await postSpeedpay(dataToSpeedpay);
                                if (resSpeed.status) {
                                    if (typeof resSpeed.data.status_json !== 'undefined') {
                                        if (resSpeed.data.status_json) {
                                            var dataToPayment = {
                                                clientId: clientId,
                                                invoiceNumber: invoiceNumber,
                                                transactionId: resSpeed.data.payment.transaction_id,
                                                vaNumber: resSpeed.data.payment.va,
                                                totalPrice: resSpeed.data.payment.gross_amount,
                                                expiredTime: resSpeed.data.payment.expired,
                                                channel: responseReservation.bank,
                                                status: "pending",
                                                jsonRequest: JSON.stringify(dataToSpeedpay),
                                                created_by: JSON.stringify(ipInfo)
                                            }
                                            var resPayment = await createPayment(dataToPayment);
                                            responseTemp = {
                                                status: true,
                                                message: "Successfully",
                                                statusCode: 200,
                                                data: resSpeed.data.payment
                                            }

                                            var dataToPaymentFcm = {
                                                clientId: clientId,
                                                invoiceNumber: invoiceNumber,
                                                transactionId: resSpeed.data.payment.transaction_id,
                                                vaNumber: resSpeed.data.payment.va,
                                                totalPrice: resSpeed.data.payment.gross_amount,
                                                expiredTime: resSpeed.data.payment.expired,
                                                channel: responseReservation.bank,
                                                status: "pending"
                                            }
                                            await postFcmConfirmation(invoiceNumber, dataToPaymentFcm);
                                        } else {
                                            responseTemp = {
                                                status: false,
                                                message: "Error Payment speedpay!",
                                                statusCode: 500
                                            }
                                        }
                                    } else {
                                        responseTemp = {
                                            status: false,
                                            message: "Error Payment speedpay",
                                            statusCode: 500
                                        }
                                    }
                                } else {
                                    responseTemp = {
                                        status: false,
                                        message: resSpeed.remarks,
                                        statusCode: 500
                                    }
                                }
                            } else {
                                responseTemp = {
                                    status: false,
                                    message: "Data registration not found",
                                    statusCode: 500
                                }
                            }
                        } else {
                            responseTemp = {
                                status: true,
                                message: "Successfully reject reservation",
                                statusCode: 200
                            }
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
                    status: true,
                    message: err.message,
                    statusCode: 500
                }
                return responseTemp;
            });
        res.status(resReservation.statusCode).send(resReservation);
    } catch (e) {
        res.status(500).send({ status: false, statusCode: 500, message: e.message });
    }
};

exports.setNewLocation = async (req, res) => {
    var ipInfo = getIP(req);
    var idUser = req.sessionIdUser;
    try {
        errorHanlde = validationBodySetNewLocation(req);
        if (errorHanlde.status) {
            throw new Error(errorHanlde.error);
        }
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        var resUserLocation = await User.findOne({
            where: { id: idUser }
        })
            .then(async responseUserLocation => {
                if (!responseUserLocation) {
                    responseTemp = {
                        status: true,
                        message: "User Not found.",
                        statusCode: 404
                    }
                } else {
                    let dataNewLocation = {
                        iduser: idUser,
                        latitude: latitude,
                        longitude: longitude,
                        created_by: JSON.stringify(ipInfo)
                    }
                    var resNewLocation = await createNewLocation(dataNewLocation);
                    if (resNewLocation) {
                        responseTemp = {
                            status: true,
                            message: "Successfully update location ",
                            statusCode: 200
                        }
                    } else {
                        responseTemp = {
                            status: false,
                            message: JSON.stringify(resNewLocation),
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
        res.status(resUserLocation.statusCode).send(resUserLocation);
    } catch (e) {
        res.status(500).send({ status: false, statusCode: 500, message: e.message });
    }
};

async function postFcmConfirmation(invoiceNumber, dataToPayment) {
    var result = {}
    var resRegistration = await Registration.findAll({
        where: { invoiceNumber: invoiceNumber },
        include: [
            {
                model: User,
                required: true
            },
        ]
    });
    var totalPrice = dataToPayment.totalPrice;
    var expiredTime = dataToPayment.expiredTime;
    var data = dataToPayment;
    var req = {
        title: "Informasi Transaksi",
        body: "No Invoice : " + invoiceNumber + " telah di konfirmasi swabber, silakan membayar senilai " + totalPrice + " sebelum " + expiredTime,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        data: data
    }
    if (resRegistration) {
        if (resRegistration.length > 0) {
            result = await api.pushNotification(req, resRegistration[0]);
        }
    }
    return result;
}

function validationBodySetOnlineOffline(req) {
    var arrError = new Array();
    var bodyInvalid = "not found in body request";
    if (typeof req.body.online === 'undefined') {
        arrError.push("online " + bodyInvalid);
    } else {
        if (req.body.online == true) {

        } else if (req.body.online == false) {

        } else {
            arrError.push("online must boolean type");
        }
    }
    if (arrError.length > 0) {
        status = true;
        error = arrError.join(", ");
    } else {
        status = false;
        error = arrError.join(", ");
    }
    response = {
        status: status,
        error: error
    }
    return response;
}

function validationBodyConfirmation(req) {
    var arrError = new Array();
    var bodyInvalid = "not found in body request";
    var isRequired = "is required";
    if (typeof req.body.confirmation === 'undefined') {
        arrError.push("confirmation " + bodyInvalid);
        if (req.body.confirmation == true) { } else if (req.body.confirmation == false) {
            if (typeof req.body.remarks === '') {
                arrError.push("remarks " + isRequired);
            }
        } else {
            arrError.push("confirmation must boolean type");
        }
    }
    if (typeof req.body.remarks === 'undefined') {
        arrError.push("remarks " + bodyInvalid);
    }
    if (typeof req.body.invoiceNumber === 'undefined') {
        arrError.push("invoiceNumber " + bodyInvalid);
    }
    if (arrError.length > 0) {
        status = true;
        error = arrError.join(", ");
    } else {
        status = false;
        error = arrError.join(", ");
    }
    response = {
        status: status,
        error: error
    }
    return response;
}

function validationBodySetNewLocation(req) {
    var arrError = new Array();
    var bodyInvalid = "not found in body request";
    if (typeof req.body.latitude === 'undefined') {
        arrError.push("latitude " + bodyInvalid);
    }
    if (typeof req.body.longitude === 'undefined') {
        arrError.push("longitude " + bodyInvalid);
    }
    if (arrError.length > 0) {
        status = true;
        error = arrError.join(", ");
    } else {
        status = false;
        error = arrError.join(", ");
    }
    response = {
        status: status,
        error: error
    }
    return response;
}

async function getRegistrations(invoiceNumber) {
    var response = new Array();
    var responseTemp = new Array();

    var result = await Registration.findAll({
        where: { invoiceNumber: invoiceNumber },
    }).then(reg => {
        var transaction_details = new Array();
        for (i = 0; i < reg.length; i++) {
            transaction_details[i] = {};
            transaction_details[i]["clientId"] = reg[i].clientId;
            transaction_details[i]["invoiceNumber"] = invoiceNumber;
            transaction_details[i]["identityNumber"] = reg[i].identityNumber;
            transaction_details[i]["identityParentNumber"] = reg[i].identityParentNumber;
            transaction_details[i]["name"] = reg[i].name;
            transaction_details[i]["gender"] = reg[i].gender;
            transaction_details[i]["birthDay"] = reg[i].birthDay;
            transaction_details[i]["birthPlace"] = reg[i].birthPlace;
            transaction_details[i]["nationality"] = reg[i].nationality;
            transaction_details[i]["address"] = reg[i].address;
            transaction_details[i]["phone"] = reg[i].phone;
            transaction_details[i]["email"] = reg[i].email;
            transaction_details[i]["serviceClientId"] = reg[i].serviceClientId;
            transaction_details[i]["price"] = reg[i].price;
            transaction_details[i]["orderType"] = reg[i].orderType;
            transaction_details[i]["dateReservation"] = reg[i].dateReservation;
            transaction_details[i]["hourReservation"] = reg[i].hourReservation;
        }
        responseTemp = {
            status: true,
            message: "Successfully",
            statusCode: 200,
            data: transaction_details
        }
        return responseTemp;
    }).catch(err => {
        responseTemp = {
            status: false,
            message: err.message,
            statusCode: 500
        }
        return responseTemp
    });
    response = result;
    return response;
}

async function postSpeedpay(dataToPayment) {
    var arrayTransactionDetail = new Array();
    var reg = dataToPayment.transaction_details;
    var transactions = dataToPayment.transaction;
    for (i = 0; i < reg.length; i++) {
        orderType = reg[i].orderType.toUpperCase();
        serviceClientId = reg[i].serviceClientId;
        arrayTransactionDetail[i] = {};
        arrayTransactionDetail[i]["price"] = reg[i].price;
        arrayTransactionDetail[i]["quantity"] = 1;
        arrayTransactionDetail[i]["name"] = reg[i].id + "/" + orderType + "/" + serviceClientId;
    }
    var requestData = {
        transactions: transactions,
        transaction_details: arrayTransactionDetail,
    }

    const options = {
        method: 'POST',
        url: speedpay.URL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': speedpay.TOKEN
        },
        body: requestData,
        json: true
    }

    return new Promise((resolve, reject) => {
        request(options, (error, response, data) => {
            if (!error && response.statusCode == 200) {
                status = true;
                remarks = "Successfully";
                data = response.body;
                statusCode = 200;
            } else {
                status = false;
                remarks = error;
                data = null;
                statusCode = 500;
            }
            response = {
                status: status,
                remarks: remarks,
                data: data,
                statusCode: statusCode
            }
            if (status) {
                if (!data.status_json) {
                    response = {
                        status: false,
                        remarks: data.errors.join(", "),
                        data: null,
                        statusCode: 500
                    }
                }
            }
            resolve(response);
        });
    });
}

async function createPayment(dataToPayment) {
    var response = new Array();
    var responseTemp = new Array();
    console.log(dataToPayment)
    var resPayment = await Payment.create(dataToPayment)
        .then(responsePayment => {
            responseTemp = {
                status: true,
                message: "Successfully",
                statusCode: 200
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

    response = resPayment;
    return response;
}

async function createNewLocation(dataToPayment) {
    var response = new Array();
    var responseTemp = new Array();

    var resUserLocation = await UserLocation.create(dataToPayment)
        .then(responseUserLocation => {
            responseTemp = {
                status: true,
                message: "Successfully",
                statusCode: 200
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

    response = resUserLocation;
    return response;
}