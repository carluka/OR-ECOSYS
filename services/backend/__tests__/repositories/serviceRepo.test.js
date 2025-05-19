const ServiceRepo = require("../../repositories/serviceRepo");

jest.mock("../../db/database", () => ({
	models: {
		Servis: {
			findAll: jest.fn(),
			findByPk: jest.fn(),
			create: jest.fn(),
			destroy: jest.fn(),
		},
		Naprava: {},
	},
	sequelize: {
		query: jest.fn(),
	},
}));

const { models, sequelize } = require("../../db/database");

describe("ServiceRepo", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test("findAll calls Servis.findAll with include Naprava", async () => {
		const mockServices = [{ idservis: 1 }];
		models.Servis.findAll.mockResolvedValue(mockServices);

		const result = await ServiceRepo.findAll();

		expect(models.Servis.findAll).toHaveBeenCalledWith({
			include: models.Naprava,
		});
		expect(result).toBe(mockServices);
	});

	test("findById calls Servis.findByPk with id and include Naprava", async () => {
		const mockService = { idservis: 1 };
		models.Servis.findByPk.mockResolvedValue(mockService);

		const result = await ServiceRepo.findById(1);

		expect(models.Servis.findByPk).toHaveBeenCalledWith(1, {
			include: models.Naprava,
		});
		expect(result).toBe(mockService);
	});

	test("create calls Servis.create with data", async () => {
		const data = { komentar: "Test" };
		const mockCreated = { idservis: 1, ...data };
		models.Servis.create.mockResolvedValue(mockCreated);

		const result = await ServiceRepo.create(data);

		expect(models.Servis.create).toHaveBeenCalledWith(data);
		expect(result).toBe(mockCreated);
	});

	test.skip("update - to be implemented", () => {}); // SKIP!!!

	test("findByDeviceId calls Servis.findAll with correct where and include", async () => {
		const mockServices = [{ idservis: 1, naprava_idnaprava: 10 }];
		models.Servis.findAll.mockResolvedValue(mockServices);

		const result = await ServiceRepo.findByDeviceId(10);

		expect(models.Servis.findAll).toHaveBeenCalledWith({
			where: { naprava_idnaprava: 10 },
			include: models.Naprava,
		});
		expect(result).toBe(mockServices);
	});

	test("deleteMultiple calls Servis.destroy with correct where clause", async () => {
		models.Servis.destroy.mockResolvedValue(3);

		const result = await ServiceRepo.deleteMultiple([1, 2, 3]);

		expect(models.Servis.destroy).toHaveBeenCalledWith({
			where: { idservis: [1, 2, 3] },
		});
		expect(result).toBeUndefined(); // no return value set in method, so undefined
	});

	describe("getBooleanServices", () => {
		test("calls sequelize.query and returns results", async () => {
			const mockResults = [{ idservis: 1, servis: true }];
			sequelize.query.mockResolvedValue([mockResults]);

			const result = await ServiceRepo.getBooleanServices();

			expect(sequelize.query).toHaveBeenCalled();
			expect(result).toBe(mockResults);
		});

		test("logs error and returns undefined on query failure", async () => {
			const consoleSpy = jest
				.spyOn(console, "error")
				.mockImplementation(() => {});
			sequelize.query.mockRejectedValue(new Error("DB error"));

			const result = await ServiceRepo.getBooleanServices();

			expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
			expect(result).toBeUndefined();

			consoleSpy.mockRestore();
		});
	});
});
