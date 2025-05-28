const { Sequelize } = require("sequelize");
const { db: cfg } = require("../config");
const defineTipNaprave = require("./tipNaprave");
const defineTipUporabnika = require("./tipUporabnika");
const defineSoba = require("./soba");
const defineNaprava = require("./naprava");
const defineServis = require("./servis");
const definePacient = require("./pacient");
const defineOperacija = require("./operacija");
const defineUporabnik = require("./uporabnik");
const defineOperacijaZaposleni = require("./operacijaZaposleni");

const sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, {
	host: cfg.host,
	dialect: cfg.dialect || "postgres",
	logging: false,
});

const TipNaprave = defineTipNaprave(sequelize);
const TipUporabnika = defineTipUporabnika(sequelize);
const Soba = defineSoba(sequelize);
const Naprava = defineNaprava(sequelize);
const Servis = defineServis(sequelize);
const Pacient = definePacient(sequelize);
const Operacija = defineOperacija(sequelize);
const Uporabnik = defineUporabnik(sequelize);
const OperacijaZaposleni = defineOperacijaZaposleni(sequelize);

Object.values(sequelize.models)
	.filter((m) => typeof m.associate === "function")
	.forEach((m) => m.associate(sequelize.models));

module.exports = sequelize.models;
