const UserTypeRepo = require("../../repositories/userTypeRepo");

jest.mock("../../db/database", () => ({
	models: {
		TipUporabnika: {
			findAll: jest.fn(),
			findByPk: jest.fn(),
		},
	},
}));

const { models } = require("../../db/database");

describe("UserTypeRepo", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test("findAll calls TipUporabnika.findAll and returns data", async () => {
		const mockUserTypes = [{ id: 1, naziv: "Admin" }];
		models.TipUporabnika.findAll.mockResolvedValue(mockUserTypes);

		const result = await UserTypeRepo.findAll();

		expect(models.TipUporabnika.findAll).toHaveBeenCalled();
		expect(result).toBe(mockUserTypes);
	});

	test("findById calls TipUporabnika.findByPk with id and returns data", async () => {
		const mockUserType = { id: 1, naziv: "Admin" };
		models.TipUporabnika.findByPk.mockResolvedValue(mockUserType);

		const result = await UserTypeRepo.findById(1);

		expect(models.TipUporabnika.findByPk).toHaveBeenCalledWith(1);
		expect(result).toBe(mockUserType);
	});
});
