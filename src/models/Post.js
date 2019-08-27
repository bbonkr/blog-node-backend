const { postState } = require('../helpers/constants');

module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define(
        'Post',
        {
            title: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(200),
                allowNull: false,
                unique: true,
            },
            markdown: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            html: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            text: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            excerpt: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            coverImage: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            isPublished: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            isPrivate: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            password: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            isPinned: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            deletedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        },
    );

    Post.associate = db => {
        db.Post.belongsTo(db.User);
        db.Post.hasMany(db.Comment);
        db.Post.hasMany(db.PostAccessLog);
        db.Post.hasMany(db.UserLikePost); // userlikepost

        db.Post.belongsToMany(db.Image, {
            through: 'PostImage',
            as: 'Images',
        });
        db.Post.belongsToMany(db.Tag, {
            through: 'PostTag',
            as: 'Tags',
        });
        db.Post.belongsToMany(db.Category, {
            through: 'PostCategory',
            as: 'Categories',
        });
        db.Post.belongsToMany(db.User, {
            through: 'UserLikePost',
            as: 'Likers',
        });
    };

    return Post;
};
