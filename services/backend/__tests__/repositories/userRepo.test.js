const UserRepo = require("../../repositories/userRepo");

jest.mock("../../db/database", () => ({
	models: {
		Uporabnik: {
			findAll: jest.fn(),
			findByPk: jest.fn(),
			findOne: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			destroy: jest.fn(),
		},
		TipUporabnika: {},
	},
}));

const { models } = require("../../db/database");

describe("UserRepo", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test("findAll calls Uporabnik.findAll with include TipUporabnika", async () => {
		const mockUsers = [{ iduporabnik: 1, email: "test@test.com" }];
		models.Uporabnik.findAll.mockResolvedValue(mockUsers);

		const result = await UserRepo.findAll();

		expect(models.Uporabnik.findAll).toHaveBeenCalledWith({
			include: [{ model: models.TipUporabnika, attributes: ["naziv"] }],
		});
		expect(result).toBe(mockUsers);
	});

	test("findById calls Uporabnik.findByPk with id and include TipUporabnika", async () => {
		const mockUser = { iduporabnik: 1, email: "test@test.com" };
		models.Uporabnik.findByPk.mockResolvedValue(mockUser);

		const result = await UserRepo.findById(1);

		expect(models.Uporabnik.findByPk).toHaveBeenCalledWith(1, {
			include: models.TipUporabnika,
		});
		expect(result).toBe(mockUser);
	});

	test("findByEmail calls Uporabnik.findOne with email", async () => {
		const mockUser = { iduporabnik: 1, email: "test@test.com" };
		models.Uporabnik.findOne.mockResolvedValue(mockUser);

		const result = await UserRepo.findByEmail("test@test.com");

		expect(models.Uporabnik.findOne).toHaveBeenCalledWith({
			where: { email: "test@test.com" },
		});
		expect(result).toBe(mockUser);
	});

	test("create calls Uporabnik.create with data", async () => {
		const data = { email: "new@test.com" };
		const mockCreated = { iduporabnik: 2, ...data };
		models.Uporabnik.create.mockResolvedValue(mockCreated);

		const result = await UserRepo.create(data);

		expect(models.Uporabnik.create).toHaveBeenCalledWith(data);
		expect(result).toBe(mockCreated);
	});

	test("update calls Uporabnik.update with id and data", async () => {
		const id = 1;
		const data = { email: "test@test.com" };
		const mockUpdateResult = [1];

		models.Uporabnik.update.mockResolvedValue(mockUpdateResult);

		const result = await UserRepo.update(id, data);

		expect(models.Uporabnik.update).toHaveBeenCalledWith(data, {
			where: { iduporabnik: id },
		});
		expect(result).toBe(mockUpdateResult);
	});

	test("deleteMultiple calls Uporabnik.destroy with ids", async () => {
		const ids = [1, 2, 3];
		const mockDeleted = 3;

		models.Uporabnik.destroy.mockResolvedValue(mockDeleted);

		const result = await UserRepo.deleteMultiple(ids);

		expect(models.Uporabnik.destroy).toHaveBeenCalledWith({
			where: { iduporabnik: ids },
		});
		expect(result).toBe(mockDeleted);
	});
});
