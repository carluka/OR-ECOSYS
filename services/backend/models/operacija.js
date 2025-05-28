const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
	class Operacija extends Model {
		static associate(models) {
			this.belongsTo(models.Pacient, { foreignKey: "pacient_idpacient" });
			this.belongsTo(models.Soba, { foreignKey: "soba_idsoba" });
			this.belongsToMany(models.Uporabnik, {
				through: models.OperacijaZaposleni,
				foreignKey: "operacija_idoperacija",
			});
		}
	}
	Operacija.init(
		{
			idoperacija: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			pacient_idpacient: { type: DataTypes.INTEGER, allowNull: false },
			soba_idsoba: { type: DataTypes.INTEGER, allowNull: false },
			datum: { type: DataTypes.DATEONLY, allowNull: false },
			cas_zacetka: { type: DataTypes.TIME, allowNull: true },
			cas_konca: { type: DataTypes.TIME, allowNull: true },
		},
		{
			sequelize,
			modelName: "Operacija",
			tableName: "operacija",
			timestamps: false,
		}
	);
	return Operacija;
};
