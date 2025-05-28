const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
	class Pacient extends Model {
		static associate(models) {
			this.hasMany(models.Operacija, { foreignKey: "pacient_idpacient" });
		}
	}
	Pacient.init(
		{
			idpacient: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			ime: { type: DataTypes.STRING(45), allowNull: false },
			priimek: { type: DataTypes.STRING(45), allowNull: false },
			fhir_info: { type: DataTypes.STRING(100), allowNull: true },
			datum_rojstva: { type: DataTypes.DATEONLY, allowNull: true },
		},
		{
			sequelize,
			modelName: "Pacient",
			tableName: "pacient",
			timestamps: false,
		}
	);
	return Pacient;
};
