// models/soba.js
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class Soba extends Model {
    static associate(models) {
      this.hasMany(models.Naprava,   { foreignKey: 'soba_idSoba' });
      this.hasMany(models.Operacija, { foreignKey: 'soba_idSoba' });
    }
  }
  Soba.init({
    idSoba:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    naziv:    { type: DataTypes.STRING(45), allowNull: false },
    lokacija: { type: DataTypes.STRING(100), allowNull: true },
  }, {
    sequelize,
    modelName: 'Soba',
    tableName: 'soba',
    timestamps: false,
  });
  return Soba;
};