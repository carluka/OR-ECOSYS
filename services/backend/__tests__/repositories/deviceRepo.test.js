const DeviceRepo = require("../../repositories/deviceRepo");

// Mocking the database

jest.mock("../../db/database", () => {
	return {
		models: {
			Naprava: {
				findAll: jest.fn(),
				findByPk: jest.fn(),
				create: jest.fn(),
				update: jest.fn(),
				destroy: jest.fn(),
			},
			Soba: {},
			TipNaprave: {},
		},
		sequelize: {
			query: jest.fn(),
		},
	};
});

const { models, sequelize } = require("../../db/database");

// Test cases for DeviceRepo

describe("DeviceRepo", () => {
	// Clear mocks after each test

	afterEach(() => {
		jest.clearAllMocks();
	});

	test("findAll calls Naprava.findAll with includes", async () => {
		const mockDevices = [{ idnaprava: 1 }];
		models.Naprava.findAll.mockResolvedValue(mockDevices);

		const result = await DeviceRepo.findAll();

		expect(models.Naprava.findAll).toHaveBeenCalledWith({
			include: [
				{ model: models.Soba, attributes: ["lokacija", "naziv"] },
				{ model: models.TipNaprave, attributes: ["naziv"] },
			],
		});
		expect(result).toBe(mockDevices);
	});

	test("findById calls Naprava.findByPk with id", async () => {
		const mockDevice = { idnaprava: 1 };
		models.Naprava.findByPk.mockResolvedValue(mockDevice);

		const result = await DeviceRepo.findById(1);

		expect(models.Naprava.findByPk).toHaveBeenCalledWith(1);
		expect(result).toBe(mockDevice);
	});

	test("create calls Naprava.create with data", async () => {
		const data = { naziv: "TestDevice" };
		const mockCreated = { idnaprava: 1, ...data };
		models.Naprava.create.mockResolvedValue(mockCreated);

		const result = await DeviceRepo.create(data);

		expect(models.Naprava.create).toHaveBeenCalledWith(data);
		expect(result).toBe(mockCreated);
	});

	test("update calls Naprava.update with id and data", async () => {
		const id = 1;
		const data = { naziv: "UpdatedName" };
		const mockUpdateResult = [1];

		models.Naprava.update.mockResolvedValue(mockUpdateResult);

		await DeviceRepo.update(id, data);

		expect(models.Naprava.update).toHaveBeenCalledWith(data, {
			where: { idnaprava: id },
		});

		expect(models.Naprava.update).toHaveBeenCalledTimes(1);
	});

	test("deleteMultiple calls Naprava.destroy with ids", async () => {
		const ids = [1, 2, 3];
		const mockDeleted = 3;

		models.Naprava.destroy.mockResolvedValue(mockDeleted);

		const result = await DeviceRepo.deleteMultiple(ids);

		expect(models.Naprava.destroy).toHaveBeenCalledWith({
			where: { idnaprava: ids },
		});
		expect(result).toBe(mockDeleted);
	});

	describe("getDevices", () => {
		let consoleSpy;

		beforeEach(() => {
			consoleSpy = jest.spyOn(console, "error").mockImplementation();
		});

		afterEach(() => {
			consoleSpy.mockRestore();
		});

		test("calls sequelize.query without filters", async () => {
			const mockResults = [{ idnaprava: 1 }];
			sequelize.query.mockResolvedValue(mockResults);

			const result = await DeviceRepo.getDevices();

			expect(sequelize.query).toHaveBeenCalled();
			expect(result).toBe(mockResults);
		});

		test("calls sequelize.query with tip_naprave filter", async () => {
			const mockResults = [];
			sequelize.query.mockResolvedValue(mockResults);

			await DeviceRepo.getDevices({ tip_naprave: "someType" });

			const queryArgs = sequelize.query.mock.calls[0][1];
			expect(queryArgs.replacements.tip_naprave).toBe("someType");
		});

		test("calls sequelize.query with servis filter", async () => {
			const mockResults = [];
			sequelize.query.mockResolvedValue(mockResults);

			await DeviceRepo.getDevices({ servis: "true" });

			const queryArgs = sequelize.query.mock.calls[0][1];
			expect(queryArgs.replacements.servis).toBe(true);
		});

		test("logs error and throws if sequelize.query fails", async () => {
			const dbError = new Error("DB error");
			sequelize.query.mockRejectedValue(dbError);

			await expect(DeviceRepo.getDevices()).rejects.toThrow("DB error");
			expect(consoleSpy).toHaveBeenCalledWith("Error in getDevices:", dbError);
		});
	});
});
