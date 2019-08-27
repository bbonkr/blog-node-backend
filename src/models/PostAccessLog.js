module.exports = (sequelize, DataTypes) => {
    const PostAccessLog = sequelize.define(
        'PostAccessLog',
        {
            ipAddress: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            userAgent: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        }
    );

    PostAccessLog.associate = db => {
        db.PostAccessLog.belongsTo(db.Post);
    };

    return PostAccessLog;
};
