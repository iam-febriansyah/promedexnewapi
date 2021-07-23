const db = require("../models");
const speedpay = require("../config/speedpay.config.js");
const Registration = db.registration;
const Payment = db.payment;
const Op = db.Sequelize.Op;
const request = require('request');
var getIP = require('ipware')().get_ip;

exports.transaction = async (req, res) => {
    var ipInfo = getIP(req);
    var response = new Array();
    var responseTemp = new Array();
    var dataRegistration = new Array();
    if (typeof req.body.transaction_details === 'undefined' || typeof req.body.transaction === 'undefined') {
        response = {
            status: false,
            message: "transaction_details or transaction is missing",
            statusCode: 500
        }
    } else {
        var reg = req.body.transaction_details;
        var pay = req.body.transaction;
        var invoiceNumber = createInvoice();
        var clientId = "";
        totalPrice = 0;
        for (i = 0; i < reg.length; i++) {
            dataRegistration[i] = {};
            dataRegistration[i]["clientId"] = reg[i].clientId;
            dataRegistration[i]["invoiceNumber"] = invoiceNumber;
            dataRegistration[i]["identityNumber"] = reg[i].identityNumber;
            dataRegistration[i]["identityParentNumber"] = reg[i].identityParentNumber;
            dataRegistration[i]["name"] = reg[i].name;
            dataRegistration[i]["gender"] = reg[i].gender;
            dataRegistration[i]["birthDay"] = reg[i].birthDay;
            dataRegistration[i]["birthPlace"] = reg[i].birthPlace;
            dataRegistration[i]["nationality"] = reg[i].nationality;
            dataRegistration[i]["address"] = reg[i].address;
            dataRegistration[i]["phone"] = reg[i].phone;
            dataRegistration[i]["email"] = reg[i].email;
            dataRegistration[i]["serviceClientId"] = reg[i].serviceClientId;
            dataRegistration[i]["price"] = reg[i].price;
            dataRegistration[i]["orderType"] = reg[i].orderType;
            dataRegistration[i]["dateReservation"] = reg[i].dateReservation;
            dataRegistration[i]["hourReservation"] = reg[i].hourReservation;
            dataRegistration[i]["created_by"] = JSON.stringify(ipInfo);
            clientId = reg[i].clientId;
            totalPrice += reg[i].price;
        }
        var resRegistration = await Registration.bulkCreate(dataRegistration)
            .then(async responseRegistration => {
                var resSpeedpay = await postSpeedpay(req, invoiceNumber, totalPrice, responseRegistration);
                console.log(resSpeedpay)
                if (typeof resSpeedpay.status_json !== 'undefined') {
                    if (resSpeedpay.status_json) {
                        var dataToPayment = {
                            clientId: clientId,
                            invoiceNumber: invoiceNumber,
                            transactionId: resSpeedpay.payment.transaction_id,
                            vaNumber: resSpeedpay.payment.va,
                            totalPrice: resSpeedpay.payment.gross_amount,
                            expiredTime: resSpeedpay.payment.expired,
                            channel: pay.channel,
                            status: "pending",
                            jsonRequest: JSON.stringify(pay),
                            created_by: JSON.stringify(ipInfo)
                        }
                        var resPayment = await createPayment(dataToPayment);
                        console.log(resPayment)
                        responseTemp = {
                            status: true,
                            message: "Successfully",
                            statusCode: 200,
                            data: resSpeedpay.payment
                        }

                    } else {
                        responseTemp = {
                            status: false,
                            message: resSpeedpay.remarks,
                            statusCode: 500
                        }
                    }
                } else {
                    await deleteRegistration(invoiceNumber);
                    responseTemp = {
                        status: false,
                        message: "Error Payment speedpay!",
                        statusCode: 500
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
        response = resRegistration;
    }
    res.status(200).send(response);
};

async function deleteRegistration(invoiceNumber) {
    var response = new Array();
    var responseTemp = new Array();

    var resDelete = await Registration.destroy({
        where: { invoiceNumber: invoiceNumber }
    })
        .then(data => {
            if (data == 1) {
                responseTemp = {
                    status: true,
                    message: "Successfully",
                    statusCode: 200
                }
            } else {
                responseTemp = {
                    status: false,
                    message: `Cannot delete Registration with id=${invoiceNumber}. Maybe Invoice Number was not found!`,
                    statusCode: 404
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

    response = resDelete;
    return response;
}

async function postSpeedpay(req, invoiceNumber, totalPrice, responseRegistration) {
    var reg = responseRegistration;
    var pay = req.body.transaction;
    var arrayTransactionDetail = new Array();

    var transactions = {
        bank: pay.channel,
        order_id: invoiceNumber,
        gross_amount: totalPrice,
        customer_email: pay.customer_email,
        customer_name: pay.customer_name,
        customer_phone: pay.customer_phone,
        expired: 2, //DALAM SATUAN JAM 
    }
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
            } else {
                status = false;
                remarks = error;
                data = null;
            }
            resolve(data);
        });
    });
}

async function createPayment(dataToPayment) {
    var response = new Array();
    var responseTemp = new Array();

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

function createInvoice() {
    let ts = Date.now();
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    month = month.toString().length == 2 ? month : "0" + month;
    date = date.toString().length == 2 ? date : "0" + date;
    minutes = minutes.toString().length == 2 ? minutes : "0" + minutes;
    seconds = seconds.toString().length == 2 ? seconds : "0" + seconds;

    var strFront = "PRMDX";
    var dateNow = year + "" + month + "" + date;
    var time = hours + "" + minutes + "" + seconds;
    var rndmNumber = randomNumber(0, 1000);
    return strFront + "/" + dateNow + "/" + time + "/" + rndmNumber;
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}