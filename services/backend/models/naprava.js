// models/naprava.js
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class Naprava extends Model {
    static associate(models) {
      this.belongsTo(models.Soba,       { foreignKey: 'soba_idSoba' });
      this.belongsTo(models.TipNaprave, { foreignKey: 'tip_naprave_idTip_naprave' });
      this.hasMany(models.Servis,         { foreignKey: 'Naprava_idNaprava' });
    }
  }
  Naprava.init({
    idNaprava:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    soba_idSoba:                 { type: DataTypes.INTEGER, allowNull: false },
    tip_naprave_idTip_naprave: { type: DataTypes.INTEGER, allowNull: false },
    naziv:                       { type: DataTypes.STRING(45), allowNull: false },
    serijska_stevilka:           { type: DataTypes.STRING(45), allowNull: true },
    znamka:                      { type: DataTypes.STRING(45), allowNull: true },
    model:                       { type: DataTypes.STRING(45), allowNull: true },
    stanje:                      { type: DataTypes.STRING(45), allowNull: true },
  }, {
    sequelize,
    modelName: 'Naprava',
    tableName: 'naprava',
    timestamps: false,
  });
  return Naprava;
};