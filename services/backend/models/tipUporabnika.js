// models/tipUporabnika.js
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class TipUporabnika extends Model {
    static associate(models) {
      this.hasMany(models.Uporabnik, { foreignKey: 'tip_uporabnika_idTip_uporabnika' });
    }
  }
  TipUporabnika.init({
    idTip_uporabnika: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    naziv:            { type: DataTypes.STRING(45), allowNull: false },
  }, {
    sequelize,
    modelName: 'TipUporabnika',
    tableName: 'tip_uporabnika',
    timestamps: false,
  });
  return TipUporabnika;
};