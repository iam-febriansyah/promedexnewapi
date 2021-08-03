module.exports = (sequelize, Sequelize) => {
    const UserSwab = sequelize.define("userswab", {
        clientId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        iduser: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        onSwab: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        online: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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

    return UserSwab;
};