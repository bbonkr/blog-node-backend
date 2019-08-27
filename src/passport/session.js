module.exports = (sequelize, DataTypes) => {
    const Session = sequelize.define(
        'Session',
        {
            sid: {
                type: DataTypes.STRING(1000),
                allowNull: false,
            },
            sess: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            expire: {
                type: DataTypes.STRING(30),
                allowNull: false,
            },
        },
        {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        }
    );

    Session.associate = db => {};

    return Session;
};
