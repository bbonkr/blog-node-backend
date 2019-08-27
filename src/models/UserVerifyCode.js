/**
 * 사용자의 전자우편 확인을 위한 코드
 */
module.exports = (sequelize, DataTypes) => {
    const UserVerifyCode = sequelize.define(
        'UserVerifyCode',
        {
            // 대상 전자우편주소 해시됨.
            email: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            // 확인용 코드
            code: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            // 만료시각 전송시각으로 부터 3시간
            expire: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        },
    );

    UserVerifyCode.associate = db => {
        db.UserVerifyCode.belongsTo(db.User);
    };

    return UserVerifyCode;
};
