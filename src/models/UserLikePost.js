module.exports = (sequelize, DataTypes) => {
    const UserLikePost = sequelize.define(
        'UserLikePost',
        {},
        {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            tableName: 'UserLikePost',
        },
    );

    UserLikePost.associate = db => {
        db.UserLikePost.belongsTo(db.User);
        db.UserLikePost.belongsTo(db.Post);
        // db.Post.belongsToMany(db.User, {
        //     through: UserLikePost,
        //     as: 'Likers',
        // });
        // db.User.belongsToMany(db.Post, {
        //     through: UserLikePost,
        //     as: 'LikePosts',
        // });
    };
    return UserLikePost;
};
