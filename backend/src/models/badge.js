const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Badge extends Model {
    static associate(models) {
      Badge.belongsToMany(models.User, { through: models.UserBadge, as: 'users' });
    }
  }

  Badge.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('achievement', 'skill', 'contribution', 'special'),
      allowNull: false
    },
    criteria: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'Badge'
  });

  return Badge;
}; 