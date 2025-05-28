const deviceCtrl = require("../../controllers/deviceCtrl");
const deviceService = require("../../services/deviceService");
const deviceRepo = require("../../repositories/deviceRepo");
const PDFDocument = require("pdfkit");

jest.mock("../../services/deviceService");
jest.mock("../../repositories/deviceRepo");

describe("deviceCtrl", () => {
	let req, res, next;

	beforeEach(() => {
		req = { params: {}, body: {}, query: {} };
		res = {
			json: jest.fn(),
			status: jest.fn().mockReturnThis(),
			end: jest.fn(),
			setHeader: jest.fn(),
			send: jest.fn(),
		};
		next = jest.fn();
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should return all devices", async () => {
			const devices = [{ id: 1 }, { id: 2 }];
			deviceService.listDevices.mockResolvedValue(devices);

			await deviceCtrl.getAll(req, res, next);

			expect(deviceService.listDevices).toHaveBeenCalled();
			expect(res.json).toHaveBeenCalledWith({ data: devices });
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			deviceService.listDevices.mockRejectedValue(error);

			await deviceCtrl.getAll(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
		});
	});

	describe("getById", () => {
		it("should return device by id", async () => {
			const device = { id: 1 };
			req.params.id = "1";
			deviceService.getDevice.mockResolvedValue(device);

			await deviceCtrl.getById(req, res, next);

			expect(deviceService.getDevice).toHaveBeenCalledWith("1");
			expect(res.json).toHaveBeenCalledWith({ data: device });
		});
	});

	describe("create", () => {
		it("should create a device", async () => {
			const newDevice = { id: 1 };
			req.body = { name: "test" };
			deviceService.createDevice.mockResolvedValue(newDevice);

			await deviceCtrl.create(req, res, next);

			expect(deviceService.createDevice).toHaveBeenCalledWith(req.body);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({ data: newDevice });
		});
	});

	describe("update", () => {
		it("should update a device", async () => {
			req.params.id = "1";
			req.body = { name: "updated" };
			deviceService.updateDevice.mockResolvedValue();

			await deviceCtrl.update(req, res, next);

			expect(deviceService.updateDevice).toHaveBeenCalledWith("1", req.body);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});
	});

	describe("remove", () => {
		it("should remove a device", async () => {
			req.params.id = "1";
			deviceService.deleteDevice.mockResolvedValue();

			await deviceCtrl.remove(req, res, next);

			expect(deviceService.deleteDevice).toHaveBeenCalledWith("1");
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});
	});

	describe("togglePower", () => {
		it("should toggle device power", async () => {
			req.params.id = "1";
			req.body.action = "on";
			deviceService.togglePower.mockResolvedValue();

			await deviceCtrl.togglePower(req, res, next);

			expect(deviceService.togglePower).toHaveBeenCalledWith("1", "on");
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ message: "Device on" });
		});
	});

	describe("removeMultiple", () => {
		it("should remove multiple devices", async () => {
			req.body.ids = [1, 2, 3];
			deviceService.deleteDevices.mockResolvedValue();

			await deviceCtrl.removeMultiple(req, res, next);

			expect(deviceService.deleteDevices).toHaveBeenCalledWith([1, 2, 3]);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});
	});

	describe("prikaz", () => {
		it("should return filtered devices", async () => {
			req.query = { tip_naprave: "type", servis: "yes" };
			const devices = [{ id: 1 }];
			deviceService.getDevices.mockResolvedValue(devices);

			await deviceCtrl.prikaz(req, res, next);

			expect(deviceService.getDevices).toHaveBeenCalledWith(req.query);
			expect(res.json).toHaveBeenCalledWith({ data: devices });
		});
	});

	describe("reportData", () => {
		it("should return report data", async () => {
			req.params.id = "1";
			const data = { foo: "bar" };
			deviceService.getDeviceReportData.mockResolvedValue(data);

			await deviceCtrl.reportData(req, res, next);

			expect(deviceService.getDeviceReportData).toHaveBeenCalledWith("1");
			expect(res.json).toHaveBeenCalledWith({ data });
		});
	});

	describe("reportPDF", () => {
		it("should return 404 if device not found", async () => {
			req.params.id = "1";
			deviceRepo.getReportData.mockResolvedValue(null);

			await deviceCtrl.reportPDF(req, res, next);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.send).toHaveBeenCalledWith("Device not found.");
		});

		it("should generate a PDF if device exists", async () => {
			req.params.id = "1";
			const device = {
				naziv: "Device1",
				tip_naprave: "TypeA",
				soba_naziv: "Room1",
				soba_lokacija: "Loc1",
				servis: true,
				servisi: [],
				operacije: [],
			};
			deviceRepo.getReportData.mockResolvedValue(device);

			// Mock PDFDocument
			const pipeMock = jest.fn();
			const endMock = jest.fn();
			jest.spyOn(PDFDocument.prototype, "pipe").mockImplementation(pipeMock);
			jest.spyOn(PDFDocument.prototype, "end").mockImplementation(endMock);

			await deviceCtrl.reportPDF(req, res, next);

			expect(res.setHeader).toHaveBeenCalledWith(
				"Content-Type",
				"application/pdf"
			);
			expect(res.setHeader).toHaveBeenCalledWith(
				"Content-Disposition",
				"attachment; filename=report-device-1.pdf"
			);
			expect(pipeMock).toHaveBeenCalledWith(res);
			expect(endMock).toHaveBeenCalled();

			PDFDocument.prototype.pipe.mockRestore();
			PDFDocument.prototype.end.mockRestore();
		});
	});
});
