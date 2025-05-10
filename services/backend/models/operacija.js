// models/operacija.js
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class Operacija extends Model {
    static associate(models) {
      this.belongsTo(models.Pacient,  { foreignKey: 'pacient_idPacient' });
      this.belongsTo(models.Soba,     { foreignKey: 'soba_idSoba' });
      this.belongsToMany(models.Uporabnik, {
        through: models.OperacijaZaposleni,
        foreignKey: 'Operacija_idOperacija',
      });
    }
  }
  Operacija.init({
    idOperacija:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pacient_idPacient: { type: DataTypes.INTEGER, allowNull: false },
    soba_idSoba:       { type: DataTypes.INTEGER, allowNull: false },
    datum:             { type: DataTypes.DATEONLY, allowNull: false },
    cas_zacetka:       { type: DataTypes.TIME, allowNull: true },
    cas_konca:         { type: DataTypes.TIME, allowNull: true },
  }, {
    sequelize,
    modelName: 'Operacija',
    tableName: 'operacija',
    timestamps: false,
  });
  return Operacija;
};