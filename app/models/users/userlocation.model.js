module.exports = (sequelize, Sequelize) => {
    const UserLocation = sequelize.define("userlocation", {
        iduser: {
            type: Sequelize.INTEGER,
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
        created_at: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false
        },
        created_by: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
        timestamps: false
    });

    return UserLocation;
};