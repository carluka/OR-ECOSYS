// models/naprava.js
const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class Naprava extends Model {
    static associate(models) {
      this.belongsTo(models.Soba, { foreignKey: "soba_idsoba" });
      this.belongsTo(models.TipNaprave, {
        foreignKey: "tip_naprave_idtip_naprave",
      });
      this.hasMany(models.Servis, { foreignKey: "naprava_idnaprava" });
    }
  }
  Naprava.init(
    {
      idnaprava: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      soba_idsoba: { type: DataTypes.INTEGER, allowNull: true },
      tip_naprave_idtip_naprave: { type: DataTypes.INTEGER, allowNull: false },
      naziv: { type: DataTypes.STRING(45), allowNull: false },
      serijska_stevilka: { type: DataTypes.STRING(45), allowNull: true },
      znamka: { type: DataTypes.STRING(45), allowNull: true },
      model: { type: DataTypes.STRING(45), allowNull: true },
      stanje: { type: DataTypes.STRING(45), allowNull: true },
      uuid: { type: DataTypes.UUID, allowNull: false },
    },
    {
      sequelize,
      modelName: "Naprava",
      tableName: "naprava",
      timestamps: false,
    }
  );
  return Naprava;
};
