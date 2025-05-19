const userService = require("../../services/userService");
const userRepo = require("../../repositories/userRepo");
const bcryptjs = require("bcryptjs");

// Mocking the repository and bcryptjs
jest.mock("../../repositories/userRepo");
jest.mock("bcryptjs");

// Test cases for UserService
describe("UserService", () => {
	// Clear mocks after each test
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("listUsers", () => {
		test("should return all users", async () => {
			const mockUsers = [{ id: 1 }, { id: 2 }];
			userRepo.findAll.mockResolvedValue(mockUsers);

			const result = await userService.listUsers();

			expect(userRepo.findAll).toHaveBeenCalled();
			expect(result).toEqual(mockUsers);
		});
	});

	describe("getUser", () => {
		test("should return user by id", async () => {
			const mockUser = { id: 1 };
			userRepo.findById.mockResolvedValue(mockUser);

			const result = await userService.getUser(1);

			expect(userRepo.findById).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockUser);
		});
	});

	describe("getUserByEmail", () => {
		test("should return user by email", async () => {
			const mockUser = { id: 1, email: "test@example.com" };
			userRepo.findByEmail.mockResolvedValue(mockUser);

			const result = await userService.getUserByEmail("test@example.com");

			expect(userRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
			expect(result).toEqual(mockUser);
		});
	});

	describe("checkGeslo", () => {
		test("should return true for correct password", async () => {
			const mockUser = {
				id: 1,
				email: "test@example.com",
				geslo: "hashedPassword",
			};
			userRepo.findByEmail.mockResolvedValue(mockUser);
			bcryptjs.compare.mockResolvedValue(true);

			const result = await userService.checkGeslo(
				"test@example.com",
				"password123"
			);

			expect(userRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
			expect(bcryptjs.compare).toHaveBeenCalledWith(
				"password123",
				"hashedPassword"
			);
			expect(result).toBe(true);
		});

		test("should return false for incorrect password", async () => {
			const mockUser = {
				id: 1,
				email: "test@example.com",
				geslo: "hashedPassword",
			};
			userRepo.findByEmail.mockResolvedValue(mockUser);
			bcryptjs.compare.mockResolvedValue(false);

			const result = await userService.checkGeslo(
				"test@example.com",
				"wrongpassword"
			);

			expect(result).toBe(false);
		});

		test("should return false when user not found", async () => {
			userRepo.findByEmail.mockResolvedValue(null);

			const result = await userService.checkGeslo(
				"nonexistent@example.com",
				"password123"
			);

			expect(result).toBe(false);
		});
	});

	describe("createUser", () => {
		test("should hash password and create user", async () => {
			const payload = { email: "test@example.com", geslo: "password123" };
			const hashedPassword = "hashedPassword123";
			const mockCreated = { id: 1, ...payload, geslo: hashedPassword };

			bcryptjs.hash.mockResolvedValue(hashedPassword);
			userRepo.create.mockResolvedValue(mockCreated);

			const result = await userService.createUser(payload);

			expect(bcryptjs.hash).toHaveBeenCalledWith("password123", 12);
			expect(userRepo.create).toHaveBeenCalledWith({
				...payload,
				geslo: hashedPassword,
			});
			expect(result).toEqual(mockCreated);
		});
	});

	describe("updateUser", () => {
		test("should hash password and update user", async () => {
			const id = 1;
			const payload = { email: "test@example.com", geslo: "newpassword" };
			const hashedPassword = "hashedNewPassword";
			const mockUpdated = [1];

			bcryptjs.hash.mockResolvedValue(hashedPassword);
			userRepo.update.mockResolvedValue(mockUpdated);

			const result = await userService.updateUser(id, payload);

			expect(bcryptjs.hash).toHaveBeenCalledWith("newpassword", 10);
			expect(userRepo.update).toHaveBeenCalledWith(id, {
				...payload,
				geslo: hashedPassword,
			});
			expect(result).toEqual(mockUpdated);
		});
	});

	describe("deleteUser", () => {
		test("should delete user", async () => {
			const id = 1;
			const mockDeleted = 1;
			userRepo.delete.mockResolvedValue(mockDeleted);

			const result = await userService.deleteUser(id);

			expect(userRepo.delete).toHaveBeenCalledWith(id);
			expect(result).toEqual(mockDeleted);
		});
	});

	describe("deleteUsers", () => {
		test("should delete multiple users", async () => {
			const ids = [1, 2, 3];
			const mockDeleted = 3;
			userRepo.deleteMultiple.mockResolvedValue(mockDeleted);

			const result = await userService.deleteUsers(ids);

			expect(userRepo.deleteMultiple).toHaveBeenCalledWith(ids);
			expect(result).toEqual(mockDeleted);
		});
	});
});
