// services/backend/models/index.js
const { Sequelize } = require('sequelize');
const { db: cfg } = require('../config');    // uvoziš iz config/index.js
const defineTipNaprave         = require('./tipNaprave');
const defineTipUporabnika      = require('./tipUporabnika');
const defineSoba               = require('./soba');
const defineNaprava            = require('./naprava');
const defineServis             = require('./servis');
const definePacient            = require('./pacient');
const defineOperacija          = require('./operacija');
const defineUporabnik          = require('./uporabnik');
const defineOperacijaZaposleni = require('./operacijaZaposleni');

// POSODOBI: zgradi instanco Sequelize z eksplicitno določenim dialect
const sequelize = new Sequelize(
  cfg.database,
  cfg.username,
  cfg.password,
  {
    host:    cfg.host,
    dialect: cfg.dialect || 'postgres',   // tu mora pisati 'postgres'
    logging: false,
  }
);

// inicializiraj modele
const TipNaprave         = defineTipNaprave(sequelize);
const TipUporabnika      = defineTipUporabnika(sequelize);
const Soba               = defineSoba(sequelize);
const Naprava            = defineNaprava(sequelize);
const Servis             = defineServis(sequelize);
const Pacient            = definePacient(sequelize);
const Operacija          = defineOperacija(sequelize);
const Uporabnik          = defineUporabnik(sequelize);
const OperacijaZaposleni = defineOperacijaZaposleni(sequelize);

// poveži relacije
Object.values(sequelize.models)
  .filter(m => typeof m.associate === 'function')
  .forEach(m => m.associate(sequelize.models));

// izvoz
module.exports = sequelize.models;