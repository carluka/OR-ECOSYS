const {
  getAll,
  getById,
  create,
  update,
  remove,
  getRoomsDeviceCount,
  removeMultiple,
  commitChanges,
  deploy,
  startDevices,
  stopDevices,
  checkStatus,
} = require("../controllers/roomCtrl");
const router = require("express").Router();

router.get("/roomsDeviceCount", getRoomsDeviceCount);
router.delete("/deleteMultiple", removeMultiple);
router.post("/commitChanges", commitChanges);
router.post("/:id/deploy", deploy);
router.post("/:id/startDevices", startDevices);
router.post("/:id/stopDevices", stopDevices);
router.get("/:id/status", checkStatus);
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
