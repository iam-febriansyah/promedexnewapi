module.exports = (sequelize, Sequelize) => {
    const Payment = sequelize.define("payment", {
        clientId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        invoiceNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },
        transactionId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        vaNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },
        totalPrice: {
            type: Sequelize.DOUBLE,
            allowNull: false
        },
        channel: {
            type: Sequelize.STRING,
            allowNull: false
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false
        },
        expiredTime: {
            type: 'TIMESTAMP',
            allowNull: false
        },
        successTime: {
            type: 'TIMESTAMP',
            allowNull: true
        },
        jsonRequest: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        jsonResponse: {
            type: Sequelize.TEXT,
            allowNull: null
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

    return Payment;
};