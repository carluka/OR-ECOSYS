const roomService = require("../services/roomService");

exports.getAll = async (req, res, next) => {
	try {
		const rooms = await roomService.listRooms();
		res.json({ data: rooms });
	} catch (err) {
		next(err);
	}
};

exports.getById = async (req, res, next) => {
	try {
		const room = await roomService.getRoom(req.params.id);
		res.json({ data: room });
	} catch (err) {
		next(err);
	}
};

exports.create = async (req, res, next) => {
	try {
		const newRoom = await roomService.createRoom(req.body);
		res.status(201).json({ data: newRoom });
	} catch (err) {
		next(err);
	}
};

exports.update = async (req, res, next) => {
	try {
		await roomService.updateRoom(req.params.id, req.body);
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

exports.remove = async (req, res, next) => {
	try {
		await roomService.deleteRoom(req.params.id);
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

exports.removeMultiple = async (req, res, next) => {
	try {
		const { ids } = req.body;
		await roomService.deleteRooms(ids);
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

exports.getRoomsDeviceCount = async (req, res, next) => {
	try {
		const rooms = await roomService.roomDeviceCount();
		res.json({ data: rooms });
	} catch (err) {
		next(err);
	}
};

exports.commitChanges = async (req, res, next) => {
	try {
		const { id } = req.body;
		await roomService.commitChanges(id);
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};
