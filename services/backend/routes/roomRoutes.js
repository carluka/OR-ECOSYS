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
  disconnectRoom,
} = require("../controllers/roomCtrl");
const router = require("express").Router();

router.get("/roomsDeviceCount", getRoomsDeviceCount);
router.delete("/deleteMultiple", removeMultiple);
router.post("/commitChanges", commitChanges);
router.post("/:id/deploy", deploy);
router.post("/:id/startDevices", startDevices);
router.post("/:id/disconnect", disconnectRoom);
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
