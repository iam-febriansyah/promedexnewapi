module.exports = (sequelize, Sequelize) => {
    const Registration = sequelize.define("registration", {
        clientId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        iduser: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        invoiceNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },
        identityNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },
        identityParentNumber: {
            type: Sequelize.STRING,
            allowNull: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        gender: {
            type: Sequelize.STRING,
            allowNull: false
        },
        birthDay: {
            type: Sequelize.DATE,
            allowNull: false
        },
        birthPlace: {
            type: Sequelize.STRING,
            allowNull: false
        },
        nationality: {
            type: Sequelize.STRING,
            allowNull: false
        },
        address: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        phone: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        serviceClientId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        price: {
            type: Sequelize.DOUBLE,
            allowNull: false
        },
        orderType: {
            type: Sequelize.STRING,
            allowNull: false
        },
        dateReservation: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        hourReservation: {
            type: Sequelize.STRING,
            allowNull: false
        },
        iduser: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        status: {
            type: Sequelize.STRING,
            allowNull: true
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

    return Registration;
};