const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Project extends Model {
    static associate(models) {
      Project.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
      Project.belongsToMany(models.User, { through: models.ProjectMember, as: 'members' });
      Project.belongsToMany(models.Skill, { through: models.ProjectSkill, as: 'skills' });
      Project.hasMany(models.ProjectApplication, { foreignKey: 'projectId', as: 'applications' });
      Project.hasMany(models.Report, { foreignKey: 'projectId', as: 'reports' });
    }
  }

  Project.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'archived'),
      defaultValue: 'active'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    maxMembers: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'Project'
  });

  return Project;
}; 