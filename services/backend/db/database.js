// services/backend/db/database.js
const { Sequelize, DataTypes } = require("sequelize");
const { db: cfg } = require("../config");

// uvozi define-funkcije
const defineTipNaprave = require("../models/tipNaprave");
const defineTipUporabnika = require("../models/tipUporabnika");
const defineSoba = require("../models/soba");
const defineNaprava = require("../models/naprava");
const defineServis = require("../models/servis");
const definePacient = require("../models/pacient");
const defineOperacija = require("../models/operacija");
const defineUporabnik = require("../models/uporabnik");
const defineOperacijaZaposleni = require("../models/operacijaZaposleni");

// 1) Ustvari Sequelize instanco
const sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, {
  host: cfg.host,
  dialect: cfg.dialect || "postgres",
  logging: false,
});

// 2) Inicializiraj modele
const TipNaprave = defineTipNaprave(sequelize, DataTypes);
const TipUporabnika = defineTipUporabnika(sequelize, DataTypes);
const Soba = defineSoba(sequelize, DataTypes);
const Naprava = defineNaprava(sequelize, DataTypes);
const Servis = defineServis(sequelize, DataTypes);
const Pacient = definePacient(sequelize, DataTypes);
const Operacija = defineOperacija(sequelize, DataTypes);
const Uporabnik = defineUporabnik(sequelize, DataTypes);
const OperacijaZaposleni = defineOperacijaZaposleni(sequelize, DataTypes);
// … ostali modeli …

// 3) Definiraj relacije
Object.values(sequelize.models)
  .filter((model) => typeof model.associate === "function")
  .forEach((model) => model.associate(sequelize.models));

// 4) Izvozi
module.exports = {
  sequelize,
  models: sequelize.models,
};
