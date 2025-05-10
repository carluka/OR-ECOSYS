const userService = require('../services/userService');

exports.getAll = async (req, res, next) => {
  try {
    const users = await userService.listUsers();
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const user = await userService.getUser(req.params.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json({ data: newUser });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    await userService.updateUser(req.params.id, req.body);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
