// models/operacijaZaposleni.js
const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
	class OperacijaZaposleni extends Model {
		static associate(models) {
			this.belongsTo(models.Operacija, { foreignKey: "operacija_idoperacija" });
			this.belongsTo(models.Uporabnik, { foreignKey: "zaposleni_idzaposleni" });
		}
	}
	OperacijaZaposleni.init(
		{
			idoperacija_zaposleni: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			operacija_idoperacija: { type: DataTypes.INTEGER, allowNull: false },
			zaposleni_idzaposleni: { type: DataTypes.INTEGER, allowNull: false },
			vloga: { type: DataTypes.STRING(45), allowNull: true },
		},
		{
			sequelize,
			modelName: "OperacijaZaposleni",
			tableName: "operacija_zaposleni",
			timestamps: false,
		}
	);
	return OperacijaZaposleni;
};
