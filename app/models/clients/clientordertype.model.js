module.exports = (sequelize, Sequelize) => {
    const ClientOrderType = sequelize.define("clientordertype", {
        clientId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        orderTypeId: {
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

    return ClientOrderType;
};