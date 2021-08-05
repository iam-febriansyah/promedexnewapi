const db = require("../../models");
const config = require("../../config/auth.config");
const {
    v1: uuidv1,
    v4: uuidv4,
} = require('uuid');

const User = db.user;
const UserDetail = db.userdetail;
const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { generalFunction, api } = require("../../middleware");
var getIP = require('ipware')().get_ip;

exports.signup = async (req, res) => {
    var ipInfo = getIP(req);
    var response = new Array();
    var responseTemp = new Array();
    var resUser = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        created_by: JSON.stringify(ipInfo),
        level: 1
    })
        .then(async user => {
            var resDetail = await createUserDetail(user, req, false);
            if (resDetail.status) {
                responseTemp = {
                    status: true,
                    message: "Successfully",
                    statusCode: 200
                }
            } else {
                await deleteUser(user);
                responseTemp = {
                    status: false,
                    message: resDetail.message,
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
    response = resUser;
    res.status(resUser.statusCode).send(response);
};

exports.signin = async (req, res) => {
    var response = new Array();
    var responseTemp = new Array();
    try {
        errorHanlde = validationBodySign(req);
        if (errorHanlde.status) {
            throw new Error(errorHanlde.error);
        }
        var resUser = await User.findOne({
            where: { username: req.body.username, level: 1 },
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
                    var passwordIsValid = bcrypt.compareSync(
                        req.body.password,
                        user.password
                    );

                    if (!passwordIsValid) {
                        responseTemp = {
                            status: true,
                            message: "Invalid Password!",
                            statusCode: 401
                        }
                    } else {
                        var token = jwt.sign({ id: user.id }, config.secretUser, {
                            expiresIn: '365d'
                        });
                        responseTemp = {
                            status: true,
                            statusCode: 200,
                            message: "Successfully",
                            accessToken: token,
                            dataUser: user
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
            });

        dataUsers = {
            id: resUser.dataUser.id,
            username: resUser.dataUser.username,
            email: resUser.dataUser.email,
            level: resUser.dataUser.level,

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
        res.status(resUser.statusCode).send(response);
    }
    catch (e) {
        res.status(500).send({ status: false, statusCode: 500, message: e.message });
    }
};

exports.otp = async (req, res) => {
    var response = new Array();
    var responseTemp = new Array();
    try {
        if (typeof req.body.phone === 'undefined' || req.body.phone === "") {
            throw new Error("phone is required");
        }
        var resUser = await User.findOne({
            where: { phone: req.body.phone, level: 1 },
            include: [
                {
                    model: UserDetail,
                    required: true
                }
            ]
        })
            .then(async user => {
                if (!user) {
                    var resCreateUser = await createUserAndDetail(req);
                    if (resCreateUser.status) {
                        var otpcode = await generalFunction.updateOtp(true, resCreateUser.user.id);
                        if (otpcode.status) {
                            responseTemp = {
                                status: true,
                                statusCode: 200,
                                message: "Successfully",
                                otpcode: otpcode.otpcode
                            }
                            await generalFunction.setTimeOTP(resCreateUser.user.id);
                        } else {
                            responseTemp = {
                                status: false,
                                statusCode: 500,
                                message: "Failed generate OTP"
                            }
                        }
                    } else {
                        responseTemp = {
                            status: false,
                            statusCode: resCreateUser.statusCode,
                            message: resCreateUser.message
                        }
                    }
                    return responseTemp;
                } else {
                    var otpcode = await generalFunction.updateOtp(true, user.id);
                    if (otpcode.status) {
                        await generalFunction.setTimeOTP(user.id);
                        responseTemp = {
                            status: true,
                            statusCode: 200,
                            message: "Successfully",
                            otpcode: otpcode.otpcode
                        }
                    } else {
                        responseTemp = {
                            status: false,
                            statusCode: 500,
                            message: "Failed generate OTP"
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

        var resOtpSend;
        if (resUser.status) {
            var message = "Your OTP Code : " + resUser.otpcode;
            resOtpSend = await api.whatsAppEazyNotifText(req.body.phone, message);
            if (resOtpSend.status) {
                response = {
                    status: resOtpSend.status,
                    statusCode: resOtpSend.statusCode,
                    message: "Please check your message, and put your OTP in here!"
                }
            } else {
                response = {
                    status: resOtpSend.status,
                    statusCode: resOtpSend.statusCode,
                    message: resOtpSend.message
                }
            }
        } else {
            response = {
                status: resUser.status,
                statusCode: resUser.statusCode,
                message: resUser.message
            }
        }
        res.status(response.statusCode).send(response);
    }
    catch (e) {
        res.status(500).send({ status: false, statusCode: 500, message: e.message });
    }
};

exports.otpConfirmation = async (req, res) => {
    var response = new Array();
    var responseTemp = new Array();
    try {
        if (typeof req.body.phone === 'undefined' || req.body.phone === "") {
            throw new Error("phone is required");
        }
        if (typeof req.body.otpcode === 'undefined' || req.body.otpcode === "") {
            throw new Error("otpcode is required");
        }
        var resUser = await User.findOne({
            where: { phone: req.body.phone, otpcode: req.body.otpcode, level: 1 },
            include: [
                {
                    model: UserDetail,
                    required: true
                }
            ]
        })
            .then(async user => {
                if (!user) {
                    responseTemp = {
                        status: false,
                        statusCode: 500,
                        message: "OTP not match",
                        accessToken: null,
                        dataUser: null
                    }
                } else {
                    var token = jwt.sign({ id: user.id }, config.secretUser, {
                        expiresIn: '365d'
                    });
                    responseTemp = {
                        status: true,
                        statusCode: 200,
                        message: "Successfully",
                        accessToken: token,
                        dataUser: user
                    }
                    await generalFunction.updateOtp(false, user.id);
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

        if (resUser.status) {
            dataUsers = {
                id: resUser.dataUser.id,
                username: resUser.dataUser.username,
                email: resUser.dataUser.email,
                level: resUser.dataUser.level,

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
        } else {
            dataUsers = null;
        }

        response = {
            status: resUser.status,
            statusCode: resUser.statusCode,
            message: resUser.message,
            accessToken: resUser.statusCode == 200 ? resUser.accessToken : null,
            dataUser: dataUsers
        }
        res.status(resUser.statusCode).send(response);
    }
    catch (e) {
        res.status(500).send({ status: false, statusCode: 500, message: e.message });
    }
};

async function deleteUser(user) {
    var response = new Array();
    var responseTemp = new Array();

    var resDelete = await User.destroy({
        where: { id: user.id }
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
                    message: `Cannot delete User with id=${user.id}. Maybe User was not found!`,
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

async function createUserDetail(user, req, isOtp) {
    var response = new Array();
    var responseTemp = new Array();
    var dataPost = {};
    if (isOtp) {
        dataPost = {
            iduser: user.id,
            name: req.body.phone,
            phone: req.body.phone,
            created_by: req.body.phone,
        }
    } else {
        dataPost = {
            iduser: user.id,
            identityNumber: req.body.identityNumber,
            identityParentNumber: req.body.identityParentNumber,
            name: req.body.name,
            gender: req.body.gender,
            birthDay: req.body.birthDay,
            birthPlace: req.body.birthPlace,
            phone: req.body.phone,
            address: req.body.address,
            nationality: req.body.nationality,
            created_by: req.body.email,
        }
    }

    var resUserDetail = await UserDetail.create(dataPost)
        .then(userDetail => {
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

    response = resUserDetail;
    return response;
}

function validationBodySign(req) {
    var arrError = new Array();
    var bodyInvalid = "not found in body request";
    var isRequired = "is required";
    if (typeof req.body.username === 'undefined' || req.body.username === "") {
        arrError.push("username " + bodyInvalid);
    }
    if (req.body.username === "") {
        arrError.push("username " + isRequired);
    }
    if (typeof req.body.password === 'undefined' || req.body.password === "") {
        arrError.push("password " + bodyInvalid);
    }
    if (req.body.password === "") {
        arrError.push("password " + isRequired);
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

async function createUserAndDetail(req) {
    var ipInfo = getIP(req);
    var resUser = await User.create({
        phone: req.body.phone,
        created_by: JSON.stringify(ipInfo),
        level: 1
    })
        .then(async user => {
            var resDetail = await createUserDetail(user, req, true);
            if (resDetail.status) {
                responseTemp = {
                    status: true,
                    message: "Successfully",
                    statusCode: 200,
                    user: user,
                    userDetail: resDetail
                }
            } else {
                await deleteUser(user);
                responseTemp = {
                    status: false,
                    message: resDetail.message,
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
    return resUser;
}

