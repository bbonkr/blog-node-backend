module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define(
        'Tag',
        {
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },            
        },
        {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        },
    );

    Tag.associate = db => {
        db.Tag.belongsToMany(db.Post, {
            through: 'PostTag',
            as: 'Posts',
        });
    };

    return Tag;
};
