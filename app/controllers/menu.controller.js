const db = require("../models");
const Menu = db.menu;
const User = db.user;
const UserDetail = db.userdetail;
const UserSwab = db.userswab;
const UserLocation = db.userlocation;
const Op = db.Sequelize.Op;

exports.findAll = async (req, res) => {
    var idUser = req.sessionIdUser;
    var response = new Array();

    var menuParam = await getMenu();
    dataMenus = menuParam.status ? menuParam.data : null;

    response = {
        status: menuParam.status,
        message: menuParam.message,
        statusCode: menuParam.statusCode,
        menus: menuParam.status ? menuParam.data : null
    }
    res.send(response);
};

exports.getListSwabbers = async (req, res) => {
    var response = new Array();
    try {
        errorHanlde = validationBody(req);
        if (errorHanlde.status) {
            throw new Error(errorHanlde.error);
        }
        var swabberParam = await getSwabbers();
        dataSwabbers = swabberParam.status ? swabberParam.data : null;

        response = {
            status: swabberParam.status,
            message: swabberParam.message,
            statusCode: swabberParam.statusCode,
            listSwabbers: dataSwabbers
        }
        res.status(swabberParam.statusCode).send(response);
    } catch (e) {
        res.status(500).send({ status: false, statusCode: 500, message: e.message });
    }
};

async function getSwabbers() {
    var response = new Array();
    var responseTemp = new Array();

    var result = await User.findAll({
        where: { level: 2 },
        include: [
            {
                model: UserDetail,
                required: true
            },
            {
                model: UserSwab,
                required: true,
                where: { online: true, onSwab: false },
            },
            {
                model: UserLocation,
                required: true,
                order: [
                    ['id', 'DESC']
                ],
                separate: true,
                limit: 1
            },
        ],
    }).then(dataUser => {
        var arr = new Array();
        for (i = 0; i < dataUser.length; i++) {
            arr[i] = {};
            arr[i]["id"] = dataUser[i].id;
            arr[i]["username"] = dataUser[i].username;
            arr[i]["email"] = dataUser[i].email;
            arr[i]["iddetail"] = dataUser[i].userdetail.id;
            arr[i]["name"] = dataUser[i].userdetail.name;
            arr[i]["gender"] = dataUser[i].userdetail.gender;
            arr[i]["phone"] = dataUser[i].userdetail.phone;
            arr[i]["onswab"] = dataUser[i].userswab.onSwab;
            arr[i]["online"] = dataUser[i].userswab.online;
            if (dataUser[i].userlocations.length > 0) {
                arr[i]["latitude"] = dataUser[i].userlocations[0].latitude;
                arr[i]["longitude"] = dataUser[i].userlocations[0].longitude;
                arr[i]["lastLocationUpdate"] = dataUser[i].userlocations[0].created_at;
            } else {
                arr[i]["latitude"] = null;
                arr[i]["longitude"] = null;
                arr[i]["lastLocationUpdate"] = null;
            }
        }
        responseTemp = {
            status: true,
            message: "Successfully",
            statusCode: 200,
            data: arr
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

async function getMenu() {
    var response = new Array();
    var responseTemp = new Array();

    var result = await Menu.findAll({
        raw: true,
        attributes: ['itemID', 'itemName', 'tag', 'collect', 'image'],
        where: { is_active: 1 },
    }).then(data => {
        var arr = new Array();
        for (i = 0; i < data.length; i++) {
            arr[i] = {};
            arr[i]["itemID"] = data[i].itemID;
            arr[i]["itemName"] = data[i].itemName;
            arr[i]["tag"] = data[i].tag;
            arr[i]["collect"] = data[i].collect;
            arr[i]["image"] = data[i].image;
        }
        responseTemp = {
            status: true,
            message: "Successfully",
            statusCode: 200,
            data: arr
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

function validationBody(req) {
    var arrError = new Array();
    var bodyInvalid = "not found in body request";
    var isRequired = "is required";
    if (typeof req.body.latitude === 'undefined') {
        arrError.push("latitude " + bodyInvalid);
    }
    if (req.body.latitude === "") {
        arrError.push("latitude " + isRequired);
    }
    if (typeof req.body.longitude === 'undefined') {
        arrError.push("longitude " + bodyInvalid);
    }
    if (req.body.password === "") {
        arrError.push("longitude " + isRequired);
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


