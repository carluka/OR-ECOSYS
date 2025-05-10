const deviceService = require('../services/deviceService');

exports.getAll = async (req, res, next) => {
  try {
    const devices = await deviceService.listDevices();
    res.json({ data: devices });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const device = await deviceService.getDevice(req.params.id);
    res.json({ data: device });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const newDevice = await deviceService.createDevice(req.body);
    res.status(201).json({ data: newDevice });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    await deviceService.updateDevice(req.params.id, req.body);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await deviceService.deleteDevice(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.togglePower = async (req, res, next) => {
  try {
    const { action } = req.body; 
    await deviceService.togglePower(req.params.id, action);
    res.status(200).json({ message: `Device ${action}` });
  } catch (err) {
    next(err);
  }
};
