// models/uporabnik.js
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class Uporabnik extends Model {
    static associate(models) {
      this.belongsTo(models.TipUporabnika, { foreignKey: 'tip_uporabnika_idTip_uporabnika' });
      this.belongsToMany(models.Operacija, {
        through: models.OperacijaZaposleni,
        foreignKey: 'Zaposleni_idZaposleni',
      });
    }
  }
  Uporabnik.init({
    idUporabnik:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tip_uporabnika_idTip_uporabnika: { type: DataTypes.INTEGER, allowNull: false },
    ime:                         { type: DataTypes.STRING(45), allowNull: false },
    priimek:                     { type: DataTypes.STRING(45), allowNull: false },
    datum_zaposlitve:            { type: DataTypes.DATEONLY, allowNull: true },
    email:                       { type: DataTypes.STRING(45), allowNull: true },
    geslo:                       { type: DataTypes.STRING(250), allowNull: false },
  }, {
    sequelize,
    modelName: 'Uporabnik',
    tableName: 'uporabnik',
    timestamps: false,
  });
  return Uporabnik;
};
