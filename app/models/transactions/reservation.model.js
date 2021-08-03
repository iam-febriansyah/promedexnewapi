module.exports = (sequelize, Sequelize) => {
    const Reservation = sequelize.define("reservation", {
        invoiceNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },
        customerName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        customerEmail: {
            type: Sequelize.STRING,
            allowNull: false
        },
        customerPhone: {
            type: Sequelize.STRING,
            allowNull: false
        },
        price: {
            type: Sequelize.DOUBLE,
            allowNull: false
        },
        bank: {
            type: Sequelize.STRING,
            allowNull: false
        },
        address: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        latitude: {
            type: Sequelize.STRING,
            allowNull: false
        },
        longitude: {
            type: Sequelize.STRING,
            allowNull: false
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        reservationType: {
            type: Sequelize.STRING,
            allowNull: false
        },
        idSwabber: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        iduser: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        remarks: {
            type: Sequelize.TEXT,
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

    return Reservation;
};