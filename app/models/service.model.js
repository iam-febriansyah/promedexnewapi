module.exports = (sequelize, Sequelize) => {
    const Service = sequelize.define("service", {
        itemID: {
            type: Sequelize.STRING,
            allowNull: false
        },
        itemName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        metode: {
            type: Sequelize.STRING,
            allowNull: true
        },
        desc: {
            type: Sequelize.STRING,
            allowNull: true
        },
        strImage1: {
            type: Sequelize.STRING,
            allowNull: false
        },
        homecareMin: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        homecareMax: {
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

    return Service;
};