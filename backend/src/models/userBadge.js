const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserBadge extends Model {
    static associate(models) {
      UserBadge.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      UserBadge.belongsTo(models.Badge, { foreignKey: 'badgeId', as: 'badge' });
    }
  }

  UserBadge.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    earnedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'UserBadge'
  });

  return UserBadge;
}; 