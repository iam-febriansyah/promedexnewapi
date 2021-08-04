const db = require("../models");
const speedpay = require("../config/speedpay.config.js");
const Registration = db.registration;
const Payment = db.payment;
const Reservation = db.reservation;
const User = db.user;
const UserSwab = db.userswab;
const UserDetail = db.userdetail;
const UserLocation = db.userlocation;
const { generalFunction, api } = require("../middleware");
const Op = db.Sequelize.Op;
const request = require('request');
var getIP = require('ipware')().get_ip;

exports.transaction = async (req, res) => {
    var idUser = req.sessionIdUser;
    var ipInfo = getIP(req);
    var response = new Array();
    var responseTemp = new Array();
    var dataRegistration = new Array();
    try {
        errorHanlde = validationBody(req);
        if (errorHanlde.status) {
            throw new Error(errorHanlde.error);
        }
        var reg = req.body.transaction_details;
        var pay = req.body.transaction;
        var invoiceNumber = createInvoice(pay.type);
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
            var type = reg[i].orderType;
            if (reg[i].orderType == 'drivethru') {
                type = "walkin"
            }
            var status = "Pending payment";
            if (pay.type == "homecare") {
                status = "Waiting swabber confirmation";
            }
            dataRegistration[i]["orderType"] = type;
            dataRegistration[i]["status"] = status;
            dataRegistration[i]["dateReservation"] = reg[i].dateReservation;
            dataRegistration[i]["hourReservation"] = reg[i].hourReservation;
            dataRegistration[i]["created_by"] = JSON.stringify(ipInfo);
            dataRegistration[i]["iduser"] = idUser;
            clientId = reg[i].clientId;
            totalPrice += reg[i].price;
        }
        var resRegistration = await Registration.bulkCreate(dataRegistration)
            .then(async responseRegistration => {
                if (pay.type == 'walkin' || pay.type == 'isoma') {
                    var resSpeedpay = await postSpeedpay(req, invoiceNumber, totalPrice, responseRegistration);
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
                                created_by: JSON.stringify(ipInfo),
                                iduser: idUser
                            }
                            var resPayment = await createPayment(dataToPayment);
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
                    responseTemp = {
                        status: true,
                        message: "Successfully",
                        statusCode: 200,
                        data: resSpeedpay.payment
                    }
                } else if (pay.type == 'homecare') {
                    var resHomeCare = await postHomeCare(req, invoiceNumber, totalPrice, responseRegistration);
                    if (resHomeCare.status) {
                        responseTemp = {
                            status: true,
                            message: "Successfully",
                            statusCode: 200,
                            data: resHomeCare.data
                        }
                        var da = await postFcmOrderHomeCare(invoiceNumber, req.body);
                    } else {
                        responseTemp = {
                            status: false,
                            message: resHomeCare.message,
                            statusCode: 500
                        }
                    }
                } else {
                    await deleteRegistration(invoiceNumber);
                    responseTemp = {
                        status: false,
                        message: "Invalid transcation type",
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
        res.status(response.statusCode).send(response);
    } catch (e) {
        res.status(500).send({ status: false, statusCode: 500, message: e.message });
    }
};

exports.statusHomecare = async (req, res) => {
    var ipInfo = getIP(req);
    var responseTemp = new Array();
    try {
        if (typeof req.body.invoiceNumber === 'undefined') {
            throw new Error("invoiceNumber not found in body request");
        }
        var invoiceNumber = req.body.invoiceNumber;
        var response = await Reservation.findOne({
            where: { invoiceNumber: invoiceNumber },
            include: [
                {
                    model: Registration,
                    required: true
                },
                {
                    model: Payment,
                    required: false
                },
                {
                    model: User,
                    required: false,
                    include: [
                        {
                            model: UserDetail,
                            required: true
                        },
                        {
                            model: UserLocation,
                            required: false,
                            order: [
                                ['id', 'DESC']
                            ],
                            separate: true,
                            limit: 1
                        },
                    ]
                }
            ]
        })
            .then(async responseRegistration => {
                var data = responseRegistration;

                var dataReservation = {};
                dataReservation["idReservation"] = data.id;
                dataReservation["invoiceNumber"] = data.invoiceNumber;
                dataReservation["customerName"] = data.customerName;
                dataReservation["customerEmail"] = data.customerEmail;
                dataReservation["customerPhone"] = data.customerPhone;
                dataReservation["address"] = data.address;
                dataReservation["latitude"] = data.latitude;
                dataReservation["longitude"] = data.longitude;
                dataReservation["status"] = data.status;
                dataReservation["status_string"] = generalFunction.status(data.status);
                dataReservation["reservationType"] = data.reservationType;

                var dataPayment = {};
                if (data.payment) {
                    dataPayment["transactionId"] = data.payment.transactionId;
                    dataPayment["vaNumber"] = data.payment.vaNumber;
                    dataPayment["totalPrice"] = data.payment.totalPrice;
                    dataPayment["channel"] = data.payment.channel;
                    dataPayment["status"] = data.payment.status;
                    dataPayment["expiredTime"] = data.payment.expiredTime;
                    dataPayment["successTime"] = data.payment.successTime;
                }
                var dataSwabber = {};
                if (data.user) {
                    dataSwabber["id"] = data.user.id;
                    dataSwabber["name"] = data.user.userdetail.name;
                    dataSwabber["phone"] = data.user.userdetail.name;
                    dataSwabber["email"] = data.user.email;
                    if (!data.user.userlocations) {
                        dataSwabber["latitude"] = data.user.userlocations[0].latitude;
                        dataSwabber["longitude"] = data.user.userlocations[0].longitude;
                        dataSwabber["lastUpdateLocation"] = data.user.userlocations[0].created_at;
                    } else {
                        dataSwabber["latitude"] = null;
                        dataSwabber["longitude"] = null;
                        dataSwabber["lastUpdateLocation"] = null;
                    }
                }

                responseTemp = {
                    status: true,
                    message: "Successfully",
                    statusCode: 200,
                    dataReservation: dataReservation,
                    dataPasiens: data.registrations,
                    dataPayment: dataPayment,
                    dataSwabber: dataSwabber
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
        res.status(response.statusCode).send(response);
    } catch (e) {
        res.status(500).send({ status: false, statusCode: 500, message: e.message });
    }
};

exports.callbackSpeedpay = async (req, res) => {
    var ipInfo = getIP(req);
    var responseTemp = new Array();
    try {
        var status = req.body.status;
        var order_id = req.body.order_id;
        var date_payment = req.body.date_payment;
        var transaction_id = req.body.transaction_id;
        var gross_amount = req.body.gross_amount;
        var va = req.body.va;

        if (status == 'SUCCESS') {
            status = 5;
            statusReg = "Payment confirm";
            statusPayment = "settelment";
            remarks = "Payment success";
            remarksFcm = "Berhasil dikonfirmasi";
        } else if (status == 'EXPIRE') {
            status = 4;
            statusReg = "Payment expire";
            statusPayment = "cancel";
            remarks = "Dibatalkan";
            remarksFcm = "Dibatalkan";
        } else {
            status = 2;
            statusReg = "Payment pending";
            statusPayment = "pending";
            remarks = "Pending Payment";
            remarksFcm = "dibuat silakan membayar sesuai batas yang telah ditentukan";
        }

        let dataReservation = {
            status: status,
            remarks: remarks,
            updated_at: dateNow,
            updated_by: "Speedpay system"
        }
        const updateReservation = await Reservation.update(dataReservation, {
            where: { invoiceNumber: invoiceNumber }
        });
        let dataPayment = {
            status: statusPayment,
            remarks: remarks,
            successTime: status = 5 ? date_payment : null,
            jsonResponse: JSON.stringify(req.body),
            updated_at: dateNow,
            updated_by: "Speedpay system"
        }
        let dataReg = {
            status: statusReg
        }
        const updatePayment = await Payment.update(dataPayment, {
            where: { invoiceNumber: invoiceNumber }
        });
        const updateRegistration = await Registraion.update(dataReg, {
            where: { invoiceNumber: invoiceNumber }
        });
        response = {
            updatePayment: updatePayment,
            updateRegistration: updateRegistration,
            updateReservation: updateReservation
        }
        await postFcmPayment(invoiceNumber, remarksFcm);
        res.status(200).send(response);
    } catch (e) {
        res.status(500).send({ status: false, statusCode: 500, message: e.message });
    }
};

async function postFcmPayment(invoiceNumber, remarksFcm) {
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
    data = {}
    req = {
        title: "Informasi Transaksi",
        body: "No Invoice : " + invoiceNumber + " telah " + remarksFcm,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        data: data
    }
    if (!resRegistration) {
        if (resRegistration.length > 0) {
            result = await api.pushNotification(req, resRegistration[0]);
        }
    }
    return result;
}

async function postFcmOrderHomeCare(invoiceNumber, reqBody) {
    var result = {}
    var resUserSwab = await User.findAll({
        where: { level: 2 },
        include: [
            {
                model: UserSwab,
                required: true,
                where: { onSwab: false, online: true },
            },
        ]
    });
    var data = {
        invoiceNumber: invoiceNumber,
        request: reqBody
    }
    var req = {
        title: "Orderan Homecare",
        body: "Ada orderan homecare nih, ayo siapa cepat dia dapat!",
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        data: data
    }
    if (resUserSwab) {
        if (resUserSwab.length > 0) {
            registration_ids = [];
            for (i = 0; i < resUserSwab.length; i++) {
                registration_ids[i] = {}
                registration_ids[i] = resUserSwab[i].fcm_token;
            }
            console.log(registration_ids)
            result = await api.pushNotificationMultiple(req, registration_ids);
        }
    }
    return result;
}

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

async function postHomeCare(req, invoiceNumber, totalPrice, responseRegistration) {
    var ipInfo = getIP(req);
    var pay = req.body.transaction;
    var idUser = req.sessionIdUser;
    dataReservation = {
        invoiceNumber: invoiceNumber,
        customerName: pay.customer_email,
        customerEmail: pay.customer_name,
        customerPhone: pay.customer_phone,
        bank: pay.channel,
        price: totalPrice,
        latitude: pay.latitude,
        longitude: pay.longitude,
        address: pay.address,
        status: 1, //1=REQUEST //2=KONFIRMASI HARUS BAYAR //3=DITOLAK //4=BATAL/EXPIRED //5=SUDAH BAYAR //6=PROSES SWAB //7=PEMERIKSAAN SAMPLE //8=SELESAI
        reservationType: 'homecare',
        idSwabber: pay.idSwabber,
        iduser: idUser,
        created_by: JSON.stringify(ipInfo)
    }
    var resReservation = await Reservation.create(dataReservation)
        .then(responseReservation => {
            responseTemp = {
                status: true,
                message: "Successfully",
                statusCode: 200,
                data: responseReservation
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

    response = resReservation;
    return response;
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

function validationBody(req) {
    var arrError = new Array();
    var bodyInvalid = "not found in body request";
    var isRequired = "is required";
    if (typeof req.body.transaction === 'undefined') {
        arrError.push("transaction " + bodyInvalid);
    } else {
        if (req.body.transaction.channel === "undefined") {
            arrError.push("channel " + bodyInvalid + " " + transaction);
        }
        if (req.body.transaction.customer_email === "undefined") {
            arrError.push("customer_email " + bodyInvalid + " " + transaction);
        }
        if (req.body.transaction.customer_name === "undefined") {
            arrError.push("customer_name " + bodyInvalid + " " + transaction);
        }
        if (req.body.transaction.customer_phone === "undefined") {
            arrError.push("customer_phone " + bodyInvalid + " " + transaction);
        }
        if (req.body.transaction.type === "undefined") {
            arrError.push("type " + bodyInvalid + " " + transaction);
        }
        if (req.body.transaction.latitude === "undefined") {
            arrError.push("latitude " + bodyInvalid + " " + transaction);
        }
        if (req.body.transaction.longitude === "undefined") {
            arrError.push("longitude " + bodyInvalid + " " + transaction);
        }
        if (req.body.transaction.address === "undefined") {
            arrError.push("address " + bodyInvalid + " " + transaction);
        }

        if (req.body.transaction.channel === "") {
            arrError.push("channel " + isRequired + " " + transaction);
        }
        if (req.body.transaction.customer_email === "") {
            arrError.push("customer_email " + isRequired + " " + transaction);
        }
        if (req.body.transaction.customer_name === "") {
            arrError.push("customer_name " + isRequired + " " + transaction);
        }
        if (req.body.transaction.customer_phone === "") {
            arrError.push("customer_phone " + isRequired + " " + transaction);
        }
        if (req.body.transaction.type === "") {
            arrError.push("type " + isRequired + " " + transaction);
        }
        if (req.body.transaction.type === "homecare") {
            if (req.body.transaction.latitude === "") {
                arrError.push("latitude " + isRequired + " " + transaction);
            }
            if (req.body.transaction.longitude === "") {
                arrError.push("longitude " + isRequired + " " + transaction);
            }
            if (req.body.transaction.address === "") {
                arrError.push("address " + isRequired + " " + transaction);
            }
        } else if (req.body.transaction.type === "walkin") {

        } else if (req.body.transaction.type === "isoma") {

        } else {
            arrError.push("type on transaction must => walkin, homecare, isoma ");
        }
    }
    if (typeof req.body.transaction_details === 'undefined') {
        arrError.push("transaction " + bodyInvalid);
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

function createInvoice(type) {
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
    return strFront + "/" + dateNow + "/" + time + "/" + type.toUpperCase() + "/" + rndmNumber;
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}