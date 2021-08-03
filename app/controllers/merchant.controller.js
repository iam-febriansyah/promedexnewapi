const db = require("../models");
const Client = db.client;
const ClientType = db.clienttype;
const ClientVisitHour = db.clientvisithour;
const ClientTag = db.clienttag;
const ClientOrderType = db.clientordertype;
const ClientChannelTransfer = db.clientchanneltransfer;
const OrderType = db.ordertype;
const Menu = db.menu;
const ClientService = db.clientservice;
const Service = db.service;
const ServiceTag = db.servicetag;
const Op = db.Sequelize.Op;

exports.findAll = async (req, res) => {
    var idUser = req.sessionIdUser;
    var response = new Array();
    var arrClient = new Array();
    var arrVisiHour = new Array();
    var arrTag = new Array();
    var arrChannel = new Array();
    var arrOrderType = new Array();
    var arrService = new Array();
    var resMerchant = await getMerchant();
    if (typeof resMerchant.status !== 'undefined') {
        if (resMerchant.status) {
            var dataClient = resMerchant.data;
            for (i = 0; i < dataClient.length; i++) {
                var dataClientType = dataClient[i].clienttype;
                var dataClientvisithours = dataClient[i].clientvisithours;
                var dataClienttags = dataClient[i].clienttags;
                var dataClientOrderType = dataClient[i].clientordertypes;
                var dataClientservices = dataClient[i].clientservices;
                var dataClientChannel = dataClient[i].clientchanneltransfers;
                for (j = 0; j < dataClientvisithours.length; j++) {
                    arrVisiHour[j] = {};
                    arrVisiHour[j] = dataClientvisithours[j].hour;
                }

                for (k = 0; k < dataClienttags.length; k++) {
                    arrTag[k] = {};
                    arrTag[k] = dataClienttags[k].menu.tag;
                }

                for (l = 0; l < dataClientOrderType.length; l++) {
                    arrOrderType[l] = {};
                    arrOrderType[l] = dataClientOrderType[l].ordertype.orderName;
                }

                for (m = 0; m < dataClientservices.length; m++) {
                    arrService[m] = {};
                    var arrServiceTag = [];
                    var serviceTag = dataClientservices[m].service.servicetags;
                    for (n = 0; n < serviceTag.length; n++) {
                        arrServiceTag[n] = {};
                        arrServiceTag[n] = serviceTag[n].menu.tag;
                    }
                    splitTag = arrServiceTag.join("|");
                    arrService[m]["serviceClientId"] = dataClientservices[m].id;
                    arrService[m]["itemID"] = dataClientservices[m].service.itemID;
                    arrService[m]["itemName"] = dataClientservices[m].service.itemName;
                    arrService[m]["metode"] = dataClientservices[m].service.metode;
                    arrService[m]["price"] = dataClientservices[m].price;
                    arrService[m]["tag"] = splitTag;
                    arrService[m]["desc"] = dataClientservices[m].desc;
                    arrService[m]["strImage1"] = dataClientservices[m].strImage1;
                    arrService[m]["homecareMin"] = dataClientservices[m].service.homecareMin;
                    arrService[m]["homecareMax"] = dataClientservices[m].service.homecareMax;
                }

                for (o = 0; o < dataClientChannel.length; o++) {
                    arrChannel[o] = {};
                    arrChannel[o] = dataClientChannel[o].channel;
                }

                arrClient[i] = {};
                arrClient[i]["itemID"] = dataClient[i].itemID;
                arrClient[i]["strBackground"] = dataClient[i].strBackground;
                arrClient[i]["itemName"] = dataClient[i].itemName;
                arrClient[i]["type"] = dataClientType.clientTypeName;
                arrClient[i]["districts"] = dataClient[i].districts;
                arrClient[i]["city"] = dataClient[i].city;
                arrClient[i]["isOpen"] = dataClient[i].isOpen;
                arrClient[i]["open"] = dataClient[i].open;
                arrClient[i]["close"] = dataClient[i].close;
                arrClient[i]["visiting_hours"] = arrVisiHour;
                arrClient[i]["tag"] = arrTag;
                arrClient[i]["orderType"] = arrOrderType;
                arrClient[i]["channels"] = arrChannel;
                arrClient[i]["service"] = arrService;
            }
        }
        response = {
            status: resMerchant.status,
            message: resMerchant.message,
            statusCode: resMerchant.statusCode,
            merchants: arrClient
        }
    } else {
        response = {
            status: false,
            message: "Internal server error",
            statusCode: 500,
            merchants: null
        }
    }
    res.send(response);
};

async function getMerchant() {
    var response = new Array();
    var responseTemp = new Array();
    var result = await Client.findAll({
        where: { isOpen: true },
        include: [
            {
                model: ClientType,
                required: true
            },
            {
                model: ClientVisitHour,
                required: false
            },
            {
                model: ClientChannelTransfer,
                required: false,
                where: { isActive: true },
            },
            {
                model: ClientTag,
                required: false,
                include: [{
                    model: Menu,
                    required: true
                }],
            },
            {
                model: ClientOrderType,
                required: false,
                include: [{
                    model: OrderType,
                    required: true
                }],
            },
            {
                model: ClientService,
                where: { isActive: true },
                required: false,
                include: [{
                    model: Service,
                    required: true,
                    include: [{
                        model: ServiceTag,
                        required: true,
                        include: [{
                            model: Menu,
                            required: true
                        }],
                    }],
                }],
            }
        ],
        order: [
            [ClientVisitHour, 'hour', 'ASC']
        ]
    })
        .then(res => {
            responseTemp = {
                status: true,
                message: "Successfully",
                statusCode: 200,
                data: res
            }
            return responseTemp;
        })
        .catch(err => {
            responseTemp = {
                status: true,
                message: err.message,
                statusCode: 500,
                data: null
            }
        });

    response = result;
    return response;
}


