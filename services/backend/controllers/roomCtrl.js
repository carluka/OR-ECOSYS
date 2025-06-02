const roomService = require("../services/roomService");
const operationService = require("../services/operationService");
const { Operacija, Soba } = require("../models");
const {
  generateIngress,
  deleteIngressRule,
} = require("../utils/generateIngress");
const { kubectlApply, kubectlScale } = require("../utils/kubectl");

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
    const path = await generateIngress(newRoom.dataValues.uuid);
    await kubectlApply(path, "or-ecosys");
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

    const rooms = await Promise.all(
      ids.map(async (id) => {
        const room = await roomService.getById(id);
        return room ? room.dataValues.uuid : null;
      })
    );

    await roomService.deleteRooms(ids);

    for (const uuid of rooms) {
      if (!uuid) {
        continue;
      }
      const pathToYaml = await deleteIngressRule(uuid);
      await kubectlApply(pathToYaml, "or-ecosys");
      console.log(`✅ Uspešno odstranjen ingress rule za room ${uuid}`);
    }
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
exports.deploy = async (req, res, next) => {
  try {
    const { id } = req.params;
    await roomService.commitChanges(id);
    res.status(200).json({ message: "Deployment kicked off" });
  } catch (err) {
    next(err);
  }
};

exports.startDevices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await roomService.getById(id);
    const devices = await roomService.getDevices(id);

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const nowPlus2 = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const startTime = nowPlus2.toTimeString().split(" ")[0];

    const newOperation = await operationService.createOperation({
      pacient_idpacient: null,
      soba_idsoba: id,
      datum: date,
      cas_zacetka: startTime,
      cas_konca: null,
    });

    await kubectlScale(`${room.uuid}-consumer`, 1);

    for (const d of devices) {
      await kubectlScale(
        `${room.uuid}-provider-${d.tipnaprave.toLowerCase()}`,
        1
      );
    }

    res.status(200).json({
      status: "available",
      wsUuid: room.uuid,
      operationID: newOperation.dataValues.idoperacija,
    });
  } catch (err) {
    next(err);
  }
};

const getCurrentTimePlus2 = () => {
  const now = new Date();
  const nowPlus2 = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return nowPlus2.toTimeString().split(" ")[0];
};

exports.stopDevices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await roomService.getById(id);
    const devices = await roomService.getDevices(id);

    await kubectlScale(`${room.uuid}-consumer`, 0);
    for (const d of devices) {
      await kubectlScale(
        `${room.uuid}-provider-${d.tipnaprave.toLowerCase()}`,
        0
      );
    }
    const latestOperation = await Operacija.findOne({
      where: {
        soba_idsoba: id,
        cas_konca: null,
      },
      order: [
        ["datum", "DESC"],
        ["cas_zacetka", "DESC"],
      ],
    });

    if (latestOperation) {
      latestOperation.cas_konca = getCurrentTimePlus2();
      await latestOperation.save();
    }

    res.status(200).json({ message: "Disconnected (pods down)" });
  } catch (err) {
    next(err);
  }
};

exports.checkStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const latestOperation = await Operacija.findOne({
      where: { soba_idsoba: id },
      order: [
        ["datum", "DESC"],
        ["cas_zacetka", "DESC"],
      ],
    });
    if (!latestOperation) {
      return res.status(200).json({ active: false });
    }
    const active = latestOperation.cas_konca === null;
    const soba = await Soba.findOne({ where: { idsoba: id } });

    const wsUuid = soba ? soba.uuid : null;

    res.status(200).json({ active, wsUuid });
  } catch (err) {
    next(err);
  }
};
