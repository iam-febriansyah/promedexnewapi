module.exports = (sequelize, Sequelize) => {
    const Client = sequelize.define("client", {
        itemID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        clientTypeId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        strBackground: {
            type: Sequelize.STRING,
            allowNull: false
        },
        itemName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        districts: {
            type: Sequelize.STRING,
            allowNull: false
        },
        city: {
            type: Sequelize.STRING,
            allowNull: false
        },
        isOpen: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        open: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        close: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        created_at: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        created_by: {
            type: Sequelize.STRING,
            allowNull: false
        },
        updated_at: {
            type: 'TIMESTAMP',
            allowNull: true
        },
        updated_by: {
            type: Sequelize.STRING,
            allowNull: true
        }
    }, {
        timestamps: false
    });

    return Client;
};