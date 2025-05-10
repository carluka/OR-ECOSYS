const express = require('express');

const roomRoutes       = require('./roomRoutes');
const deviceRoutes     = require('./deviceRoutes');
const patientRoutes    = require('./patientRoutes');
const operationRoutes  = require('./operationRoutes');
const serviceRoutes    = require('./serviceRoutes');
const userRoutes       = require('./userRoutes');

module.exports = () => {
  const router = express.Router();
  router.use('/rooms',      roomRoutes);
  router.use('/devices',    deviceRoutes);
  router.use('/patients',   patientRoutes);
  router.use('/operations', operationRoutes);
  router.use('/services',   serviceRoutes);
  router.use('/users',      userRoutes);
  return router;
};
