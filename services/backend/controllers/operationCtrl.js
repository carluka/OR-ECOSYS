const operationService = require('../services/operationService');

exports.getAll = async (req, res, next) => {
  try {
    const ops = await operationService.listOperations();
    res.json({ data: ops });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const op = await operationService.getOperation(req.params.id);
    res.json({ data: op });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const newOp = await operationService.createOperation(req.body);
    res.status(201).json({ data: newOp });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    await operationService.updateOperation(req.params.id, req.body);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await operationService.deleteOperation(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
