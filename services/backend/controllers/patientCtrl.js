const patientService = require('../services/patientService');

exports.getAll = async (req, res, next) => {
  try {
    const patients = await patientService.listPatients();
    res.json({ data: patients });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const patient = await patientService.getPatient(req.params.id);
    res.json({ data: patient });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const newPatient = await patientService.createPatient(req.body);
    res.status(201).json({ data: newPatient });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    await patientService.updatePatient(req.params.id, req.body);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await patientService.deletePatient(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
