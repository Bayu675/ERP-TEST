// File: backend/models/configTemplate.model.js (BARU)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ConfigTemplate extends Model {
    static associate(models) {
      ConfigTemplate.hasMany(models.TemplateVersion, { foreignKey: 'templateId', as: 'versions' });
      ConfigTemplate.hasMany(models.ProductLink, { foreignKey: 'templateId' });
    }
  }
  ConfigTemplate.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'ConfigTemplate',
  });
  return ConfigTemplate;
};
