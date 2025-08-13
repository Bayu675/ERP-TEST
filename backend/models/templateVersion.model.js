// File: backend/models/templateVersion.model.js (BARU)
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TemplateVersion extends Model {
    static associate(models) {
      TemplateVersion.belongsTo(models.ConfigTemplate, { foreignKey: 'templateId', as: 'template' });
    }
  }
  TemplateVersion.init({
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED'),
        defaultValue: 'DRAFT'
    },
    parameters: {
      type: DataTypes.JSONB, // [{code, label, type, unit, min, max, default, required}]
      allowNull: false,
    },
    components: {
      type: DataTypes.JSONB, // [{sku, name, qty_expression, unit, loss_factor, cost_per_unit}]
      allowNull: false,
    },
    constants: {
      type: DataTypes.JSONB, // { key: value }
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'TemplateVersion',
    // Pastikan setiap versi unik untuk satu template
    indexes: [{ unique: true, fields: ['templateId', 'version'] }]
  });
  return TemplateVersion;
};
