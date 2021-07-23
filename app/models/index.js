const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.client = require("./clients/client.model.js")(sequelize, Sequelize);
db.clienttag = require("./clients/clienttag.model.js")(sequelize, Sequelize);
db.clienttype = require("./clients/clienttype.model.js")(sequelize, Sequelize);
db.clientordertype = require("./clients/clientordertype.model.js")(sequelize, Sequelize);
db.clientvisithour = require("./clients/clientvisithour.model.js")(sequelize, Sequelize);
db.clientservice = require("./clients/clientservice.model.js")(sequelize, Sequelize);
db.clientchanneltransfer = require("./clients/clientchanneltransfer.model.js")(sequelize, Sequelize);
db.user = require("./user.model.js")(sequelize, Sequelize);
db.userdetail = require("./userdetail.model.js")(sequelize, Sequelize);
db.menu = require("./menu.model.js")(sequelize, Sequelize);
db.ordertype = require("./ordertype.model.js")(sequelize, Sequelize);
db.service = require("./service.model.js")(sequelize, Sequelize);
db.servicetag = require("./servicetag.model.js")(sequelize, Sequelize);
db.registration = require("./transactions/registration.model.js")(sequelize, Sequelize);
db.payment = require("./transactions/payment.model.js")(sequelize, Sequelize);

//CONTOH ONE TO MANY DATA TABLE USER PUNYA BANYAK DETAIL USER
// db.userdetail.belongsTo(db.user, { foreignKey: 'iduser' })
// db.user.hasMany(db.userdetail, { foreignKey: 'iduser' })

db.userdetail.belongsTo(db.user, { foreignKey: 'iduser' })
db.user.hasOne(db.userdetail, { foreignKey: 'iduser' })

db.clienttype.hasOne(db.client, { foreignKey: 'clientTypeId' })
db.client.belongsTo(db.clienttype, { foreignKey: 'clientTypeId' })

db.clientvisithour.belongsTo(db.client, { foreignKey: 'clientId' })
db.client.hasMany(db.clientvisithour, { foreignKey: 'clientId' })

db.clienttag.belongsTo(db.client, { foreignKey: 'clientId' })
db.client.hasMany(db.clienttag, { foreignKey: 'clientId' })

db.menu.hasOne(db.clienttag, { foreignKey: 'menuId' })
db.clienttag.belongsTo(db.menu, { foreignKey: 'menuId' })

db.clientordertype.belongsTo(db.client, { foreignKey: 'clientId' })
db.client.hasMany(db.clientordertype, { foreignKey: 'clientId' })

db.ordertype.hasOne(db.clientordertype, { foreignKey: 'orderTypeId' })
db.clientordertype.belongsTo(db.ordertype, { foreignKey: 'orderTypeId' })

db.clientservice.belongsTo(db.client, { foreignKey: 'clientId' })
db.client.hasMany(db.clientservice, { foreignKey: 'clientId' })

db.clientchanneltransfer.belongsTo(db.client, { foreignKey: 'clientId' })
db.client.hasMany(db.clientchanneltransfer, { foreignKey: 'clientId' })

db.service.hasOne(db.clientservice, { foreignKey: 'serviceId' })
db.clientservice.belongsTo(db.service, { foreignKey: 'serviceId' })

db.servicetag.belongsTo(db.service, { foreignKey: 'serviceId' })
db.service.hasMany(db.servicetag, { foreignKey: 'serviceId' })

db.menu.hasOne(db.servicetag, { foreignKey: 'menuId' })
db.servicetag.belongsTo(db.menu, { foreignKey: 'menuId' })


module.exports = db;