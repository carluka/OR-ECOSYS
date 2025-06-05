const roomCtrl = require("../../controllers/roomCtrl");
const roomService = require("../../services/roomService");
const { generateIngress } = require("../../utils/generateIngress");
const { kubectlApply, kubectlScale } = require("../../utils/kubectl");
const operationService = require("../../services/operationService");

jest.mock("../../services/operationService");
jest.mock("../../services/roomService");
jest.mock("../../utils/generateIngress");
jest.mock("../../utils/kubectl");

const mockRes = () => {
	const res = {};
	res.json = jest.fn().mockReturnValue(res);
	res.status = jest.fn().mockReturnValue(res);
	res.end = jest.fn();
	return res;
};

const mockNext = jest.fn();

describe("roomCtrl", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should return all rooms", async () => {
			const rooms = [{ id: 1 }, { id: 2 }];
			roomService.listRooms.mockResolvedValue(rooms);
			const req = {};
			const res = mockRes();

			await roomCtrl.getAll(req, res, mockNext);

			expect(roomService.listRooms).toHaveBeenCalled();
			expect(res.json).toHaveBeenCalledWith({ data: rooms });
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			roomService.listRooms.mockRejectedValue(error);
			const req = {};
			const res = mockRes();

			await roomCtrl.getAll(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("getById", () => {
		it("should return room by id", async () => {
			const room = { id: 1 };
			roomService.getRoom.mockResolvedValue(room);
			const req = { params: { id: 1 } };
			const res = mockRes();

			await roomCtrl.getById(req, res, mockNext);

			expect(roomService.getRoom).toHaveBeenCalledWith(1);
			expect(res.json).toHaveBeenCalledWith({ data: room });
		});
	});

	describe("create", () => {
		it("should create a room and apply ingress", async () => {
			const newRoom = { dataValues: { uuid: "abc", idsoba: 2 } };
			roomService.createRoom.mockResolvedValue(newRoom);
			generateIngress.mockResolvedValue("some-path");
			kubectlApply.mockResolvedValue();
			const req = { body: { name: "test" } };
			const res = mockRes();

			await roomCtrl.create(req, res, mockNext);

			expect(roomService.createRoom).toHaveBeenCalledWith(req.body);
			expect(generateIngress).toHaveBeenCalledWith("abc");
			expect(kubectlApply).toHaveBeenCalledWith("some-path", "or-ecosys");
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({ data: newRoom });
		});
	});

	describe("update", () => {
		it("should update a room", async () => {
			roomService.updateRoom.mockResolvedValue();
			const req = { params: { id: 1 }, body: { name: "new" } };
			const res = mockRes();

			await roomCtrl.update(req, res, mockNext);

			expect(roomService.updateRoom).toHaveBeenCalledWith(1, req.body);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});
	});

	describe("remove", () => {
		it("should remove a room", async () => {
			roomService.deleteRoom.mockResolvedValue();
			const req = { params: { id: 1 } };
			const res = mockRes();

			await roomCtrl.remove(req, res, mockNext);

			expect(roomService.deleteRoom).toHaveBeenCalledWith(1);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});
	});

	describe("removeMultiple", () => {
		it("should remove multiple rooms", async () => {
			roomService.deleteRooms.mockResolvedValue();
			const req = { body: { ids: [1, 2] } };
			const res = mockRes();

			await roomCtrl.removeMultiple(req, res, mockNext);

			expect(roomService.deleteRooms).toHaveBeenCalledWith([1, 2]);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});
	});

	describe("getRoomsDeviceCount", () => {
		it("should return rooms device count", async () => {
			const rooms = [{ id: 1, count: 2 }];
			roomService.roomDeviceCount.mockResolvedValue(rooms);
			const req = {};
			const res = mockRes();

			await roomCtrl.getRoomsDeviceCount(req, res, mockNext);

			expect(roomService.roomDeviceCount).toHaveBeenCalled();
			expect(res.json).toHaveBeenCalledWith({ data: rooms });
		});
	});

	describe("commitChanges", () => {
		it("should commit changes", async () => {
			roomService.commitChanges.mockResolvedValue();
			const req = { body: { id: 1 } };
			const res = mockRes();

			await roomCtrl.commitChanges(req, res, mockNext);

			expect(roomService.commitChanges).toHaveBeenCalledWith(1);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});
	});

	describe("deploy", () => {
		it("should deploy and return message", async () => {
			roomService.commitChanges.mockResolvedValue();
			const req = { params: { id: 1 } };
			const res = mockRes();

			await roomCtrl.deploy(req, res, mockNext);

			expect(roomService.commitChanges).toHaveBeenCalledWith(1);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				message: "Deployment kicked off",
			});
		});
	});

	describe("startDevices", () => {
		it("should start devices and return status", async () => {
			const room = { uuid: "room-uuid" };
			const devices = [{ tipnaprave: "TYPE1" }, { tipnaprave: "TYPE2" }];
			roomService.getById.mockResolvedValue(room);
			roomService.getDevices.mockResolvedValue(devices);
			operationService.createOperation.mockResolvedValue({
				dataValues: { idoperacija: 123 },
			});
			kubectlScale.mockResolvedValue();
			const req = { params: { id: 1 } };
			const res = mockRes();

			await roomCtrl.startDevices(req, res, mockNext);

			expect(roomService.getById).toHaveBeenCalledWith(1);
			expect(roomService.getDevices).toHaveBeenCalledWith(1);
			expect(kubectlScale).toHaveBeenCalledWith("room-uuid-consumer", 1);
			expect(kubectlScale).toHaveBeenCalledWith("room-uuid-provider-type1", 1);
			expect(kubectlScale).toHaveBeenCalledWith("room-uuid-provider-type2", 1);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				status: "available",
				wsUuid: "room-uuid",
				operationID: 123,
			});
		});
	});

	describe("disconnectRoom", () => {
		it("should disconnect room and scale pods down", async () => {
			const room = { uuid: "room-uuid" };
			const devices = [{ tipnaprave: "TYPE1" }, { tipnaprave: "TYPE2" }];
			roomService.getById.mockResolvedValue(room);
			roomService.getDevices.mockResolvedValue(devices);
			kubectlScale.mockResolvedValue();
			const req = { params: { id: 1 } };
			const res = mockRes();

			await roomCtrl.stopDevices(req, res, mockNext);

			expect(roomService.getById).toHaveBeenCalledWith(1);
			expect(roomService.getDevices).toHaveBeenCalledWith(1);
			expect(kubectlScale).toHaveBeenCalledWith("room-uuid-consumer", 0);
			expect(kubectlScale).toHaveBeenCalledWith("room-uuid-provider-type1", 0);
			expect(kubectlScale).toHaveBeenCalledWith("room-uuid-provider-type2", 0);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				message: "Disconnected (pods down)",
			});
		});
	});
});
