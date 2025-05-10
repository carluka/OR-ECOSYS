const servisService = require('../services/serviceService');

exports.getAll = async (req, res, next) => {
  try {
    const services = await servisService.listServices();
    res.json({ data: services });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const service = await servisService.getService(req.params.id);
    res.json({ data: service });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const newService = await servisService.createService(req.body);
    res.status(201).json({ data: newService });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    await servisService.updateService(req.params.id, req.body);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await servisService.deleteService(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
