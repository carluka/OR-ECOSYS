const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
	class Servis extends Model {
		static associate(models) {
			this.belongsTo(models.Naprava, {
				foreignKey: "naprava_idnaprava",
				onDelete: "CASCADE",
			});
		}
	}
	Servis.init(
		{
			idservis: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			naprava_idnaprava: { type: DataTypes.INTEGER, allowNull: false },
			datum: { type: DataTypes.DATEONLY, allowNull: false },
			ura: { type: DataTypes.TIME, allowNull: false },
			komentar: { type: DataTypes.STRING(300), allowNull: true },
		},
		{
			sequelize,
			modelName: "Servis",
			tableName: "servis",
			timestamps: false,
		}
	);
	return Servis;
};
