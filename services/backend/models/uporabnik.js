// models/uporabnik.js
const { Model, DataTypes } = require("sequelize");
const bcryptjs = require("bcryptjs");

module.exports = (sequelize) => {
	class Uporabnik extends Model {
		static associate(models) {
			this.belongsTo(models.TipUporabnika, {
				foreignKey: "tip_uporabnika_idtip_uporabnika",
			});
			this.belongsToMany(models.Operacija, {
				through: models.OperacijaZaposleni,
				foreignKey: "zaposleni_idzaposleni",
			});
		}

		// instance method za primerjavo gesla
		async checkGeslo(pw) {
			return bcrypt.compare(pw, this.geslo);
		}

		// instance method za generiranje JWT
		generateJWT() {
			const jwt = require("jsonwebtoken");
			const payload = {
				id: this.idUporabnik,
				tip: this.tip_uporabnika_idtip_uporabnika,
				email: this.email,
			};
			return jwt.sign(payload, process.env.JWT_SECRET, {
				expiresIn: process.env.JWT_EXPIRES_IN || "1h",
			});
		}
	}

	Uporabnik.init(
		{
			iduporabnik: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			tip_uporabnika_idtip_uporabnika: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			ime: {
				type: DataTypes.STRING(45),
				allowNull: false,
			},
			priimek: {
				type: DataTypes.STRING(45),
				allowNull: false,
			},
			datum_zaposlitve: {
				type: DataTypes.DATEONLY,
				allowNull: true,
			},
			email: {
				type: DataTypes.STRING(45),
				allowNull: false,
				unique: true,
				validate: { isEmail: true },
			},
			geslo: {
				type: DataTypes.STRING(250),
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: "Uporabnik",
			tableName: "uporabnik",
			timestamps: false,
		}
	);

	return Uporabnik;
};
