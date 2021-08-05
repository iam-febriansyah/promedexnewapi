module.exports = (sequelize, Sequelize) => {
    const UserDetail = sequelize.define("userdetail", {
        iduser: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        identityNumber: {
            type: Sequelize.STRING,
            allowNull: true
        },
        identityParentNumber: {
            type: Sequelize.STRING,
            allowNull: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: true
        },
        gender: {
            type: Sequelize.STRING,
            allowNull: true
        },
        birthDay: {
            type: Sequelize.DATE,
            allowNull: true
        },
        birthPlace: {
            type: Sequelize.STRING,
            allowNull: true
        },
        nationality: {
            type: Sequelize.STRING,
            allowNull: true
        },
        address: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        phone: {
            type: Sequelize.INTEGER
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