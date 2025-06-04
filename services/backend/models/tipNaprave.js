const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class TipNaprave extends Model {
    static associate(models) {
      this.hasMany(models.Naprava, { foreignKey: "tip_naprave_idtip_naprave" });
    }
  }

  TipNaprave.init(
    {
      idtip_naprave: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      naziv: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      naziv_k8s: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "TipNaprave",
      tableName: "tip_naprave",
      timestamps: false,
    }
  );

  return TipNaprave;
};
