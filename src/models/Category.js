module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define(
        'Category',
        {
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            ordinal: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        }
    );

    Category.associate = db => {
        db.Category.belongsTo(db.User);
        db.Category.belongsToMany(db.Post, {
            through: 'PostCategory',
            as: 'Posts',
        });
    };

    return Category;
};
