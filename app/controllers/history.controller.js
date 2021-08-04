const db = require("../models");
const Registration = db.registration;
const Payment = db.payment;
const ClientService = db.clientservice;
const Service = db.service;
const Reservation = db.reservation;
const UserDetail = db.userdetail;
const UserLocation = db.userlocation;
const { generalFunction, api } = require("../middleware");
const Op = db.Sequelize.Op;
const Sequelize = require('sequelize');
const request = require('request');
var getIP = require('ipware')().get_ip;

exports.history = async (req, res) => {
    var idUser = req.sessionIdUser;
    var response = new Array();
    var responseTemp = new Array();

    try {
        var result = await Payment.findAll({
            where: { iduser: idUser },
            include: [
                {
                    model: Registration,
                    required: true,
                    include: [{
                        model: ClientService,
                        where: { isActive: true },
                        required: false,
                        include: [{
                            model: Service,
                            required: true
                        }],
                    }]
                }
            ],
            order: [
                ['id', 'DESC']
            ],
        }).then(data => {
            var arr = new Array();
            if (!data) {
                responseTemp = {
                    status: false,
                    message: "Error get data payment",
                    statusCode: 500
                }
            } else {
                if (data.length > 0) {
                    for (j = 0; j < data.length; j++) {
                        var dataResponsePayment = new Array();
                        dataResponsePayment[j] = {};
                        dataResponsePayment[j]['invoiceNumber'] = data[j].invoiceNumber;
                        dataResponsePayment[j]['totalPrice'] = data[j].totalPrice;
                        dataResponsePayment[j]['channel'] = data[j].channel;
                        dataResponsePayment[j]['status'] = data[j].status;
                        dataResponsePayment[j]['expiredTime'] = data[j].expiredTime;
                        dataResponsePayment[j]['successTime'] = data[j].successTime;
                        dataResponsePayment[j]['created_at'] = data[j].created_at;
                        var reg = data[j].registrations;
                        var dataResponseRegistrations = new Array();
                        for (i = 0; i < reg.length; i++) {

                            dataResponseRegistrations[i] = {};
                            dataResponseRegistrations[i]["clientId"] = reg[i].clientId;
                            dataResponseRegistrations[i]["invoiceNumber"] = reg[i].invoiceNumber;
                            dataResponseRegistrations[i]["identityNumber"] = reg[i].identityNumber;
                            dataResponseRegistrations[i]["identityParentNumber"] = reg[i].identityParentNumber;
                            dataResponseRegistrations[i]["name"] = reg[i].name;
                            dataResponseRegistrations[i]["gender"] = reg[i].gender;
                            dataResponseRegistrations[i]["birthDay"] = reg[i].birthDay;
                            dataResponseRegistrations[i]["birthPlace"] = reg[i].birthPlace;
                            dataResponseRegistrations[i]["nationality"] = reg[i].nationality;
                            dataResponseRegistrations[i]["address"] = reg[i].address;
                            dataResponseRegistrations[i]["phone"] = reg[i].phone;
                            dataResponseRegistrations[i]["email"] = reg[i].email;
                            dataResponseRegistrations[i]["serviceClientId"] = reg[i].serviceClientId;
                            dataResponseRegistrations[i]["serviceName"] = reg[i].clientservice.service.itemName;
                            dataResponseRegistrations[i]["price"] = reg[i].price;
                            dataResponseRegistrations[i]["status"] = reg[i].status;
                            dataResponseRegistrations[i]["orderType"] = reg[i].orderType;
                            dataResponseRegistrations[i]["dateReservation"] = reg[i].dateReservation;
                            dataResponseRegistrations[i]["hourReservation"] = reg[i].hourReservation;
                        }
                        dataResponsePayment[j]['registrations'] = dataResponseRegistrations;
                    }

                    responseTemp = {
                        status: true,
                        message: "Successfully",
                        statusCode: 200,
                        data: dataResponsePayment
                    }
                } else {
                    responseTemp = {
                        status: false,
                        message: "Data Payment Not Found",
                        statusCode: 404
                    }
                }
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
        res.status(response.statusCode).send(response);
    } catch (e) {
        res.status(500).send({ status: false, statusCode: 500, message: e.message });
    }
};

exports.historySwabber = async (req, res) => {
    var idUser = req.sessionIdUser;
    var response = new Array();
    var responseTemp = new Array();

    try {
        var result = await Reservation.findAll({
            where: { idSwabber: idUser },
            include: [
                {
                    model: Payment,
                    raw: true,
                    attributes: ['vaNumber', 'totalPrice', 'channel', 'status', 'expiredTime', 'successTime'],
                    required: false,
                },
                {
                    model: Registration,
                    required: true,
                    include: [{
                        model: ClientService,
                        where: { isActive: true },
                        required: false,
                        include: [{
                            model: Service,
                            required: true
                        }],
                    }]
                }
            ],
            order: [
                ['id', 'DESC']
            ],
        }).then(data => {
            var arr = new Array();
            if (!data) {
                responseTemp = {
                    status: false,
                    message: "Error get data payment",
                    statusCode: 500
                }
            } else {
                if (data.length > 0) {
                    var dataResponsePayment = new Array();
                    for (j = 0; j < data.length; j++) {
                        dataResponsePayment[j] = {};
                        dataResponsePayment[j]['invoiceNumber'] = data[j].invoiceNumber;
                        dataResponsePayment[j]['customerName'] = data[j].customerName;
                        dataResponsePayment[j]['customerEmail'] = data[j].customerEmail;
                        dataResponsePayment[j]['customerPhone'] = data[j].customerPhone;
                        dataResponsePayment[j]['address'] = data[j].address;
                        dataResponsePayment[j]['status'] = data[j].status;
                        dataResponsePayment[j]['status_string'] = generalFunction.status(data[j].status);
                        dataResponsePayment[j]['latitude'] = data[j].latitude;
                        dataResponsePayment[j]['longitude'] = data[j].longitude;
                        dataResponsePayment[j]['iduser'] = data[j].iduser;
                        dataResponsePayment[j]['created_at'] = data[j].created_at;

                        dataResponsePayment[j]['payment'] = data[j].payment;
                        var reg = data[j].registrations;
                        var dataResponseRegistrations = new Array();
                        for (i = 0; i < reg.length; i++) {
                            dataResponseRegistrations[i] = {};
                            dataResponseRegistrations[i]["clientId"] = reg[i].clientId;
                            dataResponseRegistrations[i]["invoiceNumber"] = reg[i].invoiceNumber;
                            dataResponseRegistrations[i]["identityNumber"] = reg[i].identityNumber;
                            dataResponseRegistrations[i]["identityParentNumber"] = reg[i].identityParentNumber;
                            dataResponseRegistrations[i]["name"] = reg[i].name;
                            dataResponseRegistrations[i]["gender"] = reg[i].gender;
                            dataResponseRegistrations[i]["birthDay"] = reg[i].birthDay;
                            dataResponseRegistrations[i]["birthPlace"] = reg[i].birthPlace;
                            dataResponseRegistrations[i]["nationality"] = reg[i].nationality;
                            dataResponseRegistrations[i]["address"] = reg[i].address;
                            dataResponseRegistrations[i]["phone"] = reg[i].phone;
                            dataResponseRegistrations[i]["email"] = reg[i].email;
                            dataResponseRegistrations[i]["status"] = reg[i].status;
                            dataResponseRegistrations[i]["serviceClientId"] = reg[i].serviceClientId;
                            dataResponseRegistrations[i]["serviceName"] = reg[i].clientservice.service.itemName;
                            dataResponseRegistrations[i]["price"] = reg[i].price;
                            dataResponseRegistrations[i]["orderType"] = reg[i].orderType;
                            dataResponseRegistrations[i]["dateReservation"] = reg[i].dateReservation;
                            dataResponseRegistrations[i]["hourReservation"] = reg[i].hourReservation;
                        }
                        dataResponsePayment[j]['registrations'] = dataResponseRegistrations;
                    }

                    responseTemp = {
                        status: true,
                        message: "Successfully",
                        statusCode: 200,
                        data: dataResponsePayment
                    }
                } else {
                    responseTemp = {
                        status: false,
                        message: "Data Payment Not Found",
                        statusCode: 404
                    }
                }
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
        res.status(response.statusCode).send(response);
    } catch (e) {
        res.status(500).send({ status: false, statusCode: 500, message: e.message });
    }
};

async function getDataPayment(invoiceNumber) {
    var responseTemp = new Array();
    try {
        var result = await Payment.findOne({
            raw: true,
            where: { invoiceNumber: invoiceNumber },
            order: [
                ['id', 'DESC']
            ],
        }).then(data => {
            if (!data) {
                responseTemp = {
                    status: false,
                    message: "Error get data payment",
                    statusCode: 500
                }
            } else {
                if (data.length > 0) {
                    responseTemp = {
                        status: true,
                        message: "Successfully",
                        statusCode: 200,
                        data: data
                    }
                } else {
                    responseTemp = {
                        status: false,
                        message: "Data Payment Not Found",
                        statusCode: 404
                    }
                }
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

        return result;
    } catch (e) {
        responseTemp = {
            status: false,
            message: e.message,
            statusCode: 500
        }
        return responseTemp;
    }
}

async function getDataRegistrasi(invoiceNumber) {
    var responseTemp = new Array();
    try {
        var result = await Registration.findAll({
            raw: true,
            where: { invoiceNumber: invoiceNumber },
            order: [
                ['name', 'ASC']
            ],
        }).then(data => {
            if (!data) {
                responseTemp = {
                    status: false,
                    message: "Error get data regitrasis",
                    statusCode: 500
                }
            } else {
                if (data.length > 0) {
                    responseTemp = {
                        status: true,
                        message: "Successfully",
                        statusCode: 200,
                        data: data
                    }
                } else {
                    responseTemp = {
                        status: false,
                        message: "Data Payment Not Found",
                        statusCode: 404
                    }
                }
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

        return result;
    } catch (e) {
        responseTemp = {
            status: false,
            message: e.message,
            statusCode: 500
        }
        return responseTemp;
    }
}