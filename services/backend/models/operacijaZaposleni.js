// models/operacijaZaposleni.js
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class OperacijaZaposleni extends Model {
    static associate(models) {
      this.belongsTo(models.Operacija, { foreignKey: 'Operacija_idOperacija' });
      this.belongsTo(models.Uporabnik, { foreignKey: 'Zaposleni_idZaposleni' });
    }
  }
  OperacijaZaposleni.init({
    idOperacija_zaposleni: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Operacija_idOperacija: { type: DataTypes.INTEGER, allowNull: false },
    Zaposleni_idZaposleni: { type: DataTypes.INTEGER, allowNull: false },
    vloga:                  { type: DataTypes.STRING(45), allowNull: true },
  }, {
    sequelize,
    modelName: 'OperacijaZaposleni',
    tableName: 'operacija_zaposleni',
    timestamps: false,
  });
  return OperacijaZaposleni;
};