const db = require("../models");
const Menu = db.menu;
const Serive = db.service;
const Op = db.Sequelize.Op;

exports.findAll = async (req, res) => {
    var idUser = req.userIdByToken;
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

async function getMenu() {
    var response = new Array();
    var responseTemp = new Array();

    var result = await Menu.findAll({
        raw: true,
        attributes: ['itemID', 'itemName', 'tag', 'collect', 'image'],
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


