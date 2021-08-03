module.exports = (sequelize, Sequelize) => {
    const UserDetail = sequelize.define("userdetail", {
        iduser: {
            type: Sequelize.INTEGER,
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

    return UserDetail;
};