module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            username: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            displayName: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(200),
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            isEmailConfirmed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            photo: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
        },
        {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        },
    );

    User.associate = db => {
        db.User.hasMany(db.Category);
        db.User.hasMany(db.Post);
        db.User.hasMany(db.Image);
        db.User.hasMany(db.Comment);
        db.User.hasMany(db.UserVerifyCode);
        db.User.hasMany(db.ResetPasswordCode);
        db.User.hasMany(db.UserLikePost);
        db.User.belongsToMany(db.Post, {
            through: 'UserLikePost',
            as: 'LikePosts',
        });
    };
    return User;
};
