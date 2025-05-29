const userCtrl = require("../../controllers/userCtrl");
const userService = require("../../services/userService");
const jwt = require("jsonwebtoken");

jest.mock("../../services/userService");
jest.mock("jsonwebtoken");

describe("userCtrl", () => {
	let req, res, next;

	beforeEach(() => {
		req = { params: {}, body: {}, cookies: {} };
		res = {
			json: jest.fn().mockReturnThis(),
			status: jest.fn().mockReturnThis(),
			end: jest.fn().mockReturnThis(),
			cookie: jest.fn().mockReturnThis(),
			clearCookie: jest.fn().mockReturnThis(),
			getHeaders: jest.fn(() => ({})),
		};
		next = jest.fn();
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should return users", async () => {
			const users = [{ id: 1 }];
			userService.listUsers.mockResolvedValue(users);
			await userCtrl.getAll(req, res, next);
			expect(res.json).toHaveBeenCalledWith({ data: users });
		});
		it("should call next on error", async () => {
			const err = new Error();
			userService.listUsers.mockRejectedValue(err);
			await userCtrl.getAll(req, res, next);
			expect(next).toHaveBeenCalledWith(err);
		});
	});

	describe("getById", () => {
		it("should return user by id", async () => {
			const user = { id: 1 };
			req.params.id = 1;
			userService.getUser.mockResolvedValue(user);
			await userCtrl.getById(req, res, next);
			expect(res.json).toHaveBeenCalledWith({ data: user });
		});
		it("should call next on error", async () => {
			const err = new Error();
			userService.getUser.mockRejectedValue(err);
			await userCtrl.getById(req, res, next);
			expect(next).toHaveBeenCalledWith(err);
		});
	});

	describe("create", () => {
		it("should create a user", async () => {
			const newUser = { id: 2 };
			req.body = { name: "test" };
			userService.createUser.mockResolvedValue(newUser);
			await userCtrl.create(req, res, next);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({ data: newUser });
		});
		it("should call next on error", async () => {
			const err = new Error();
			userService.createUser.mockRejectedValue(err);
			await userCtrl.create(req, res, next);
			expect(next).toHaveBeenCalledWith(err);
		});
	});

	describe("update", () => {
		it("should update a user", async () => {
			req.params.id = 1;
			req.body = { name: "updated" };
			userService.updateUser.mockResolvedValue();
			await userCtrl.update(req, res, next);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});
		it("should call next on error", async () => {
			const err = new Error();
			userService.updateUser.mockRejectedValue(err);
			await userCtrl.update(req, res, next);
			expect(next).toHaveBeenCalledWith(err);
		});
	});

	describe("remove", () => {
		it("should remove a user", async () => {
			req.params.id = 1;
			userService.deleteUser.mockResolvedValue();
			await userCtrl.remove(req, res, next);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});
		it("should call next on error", async () => {
			const err = new Error();
			userService.deleteUser.mockRejectedValue(err);
			await userCtrl.remove(req, res, next);
			expect(next).toHaveBeenCalledWith(err);
		});
	});

	describe("register", () => {
		it("should register a user", async () => {
			const novi = { iduporabnik: 5 };
			req.body = {
				ime: "A",
				priimek: "B",
				email: "a@b.com",
				geslo: "pw",
				tip_uporabnika_idtip_uporabnika: 1,
			};
			userService.createUser.mockResolvedValue(novi);
			await userCtrl.register(req, res, next);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({
				message: "Ustvarjen nov uporabnik",
				id: novi.iduporabnik,
			});
		});
		it("should call next on error", async () => {
			const err = new Error();
			userService.createUser.mockRejectedValue(err);
			await userCtrl.register(req, res, next);
			expect(next).toHaveBeenCalledWith(err);
		});
	});

	describe("login", () => {
		it("should login successfully", async () => {
			const user = { email: "a@b.com" };
			req.body = { email: "a@b.com", geslo: "pw" };
			userService.getUserByEmail.mockResolvedValue(user);
			userService.checkGeslo.mockResolvedValue(true);
			jwt.sign.mockReturnValue("token123");
			await userCtrl.login(req, res, next);
			expect(res.cookie).toHaveBeenCalledWith("token", "token123", {
				httpOnly: true,
			});
			expect(res.json).toHaveBeenCalledWith({ message: "Prijava uspešna" });
		});
		it("should fail if user not found", async () => {
			req.body = { email: "a@b.com", geslo: "pw" };
			userService.getUserByEmail.mockResolvedValue(null);
			await userCtrl.login(req, res, next);
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				message: "Napačen email ali geslo",
			});
		});
		it("should fail if password is wrong", async () => {
			const user = { email: "a@b.com" };
			req.body = { email: "a@b.com", geslo: "pw" };
			userService.getUserByEmail.mockResolvedValue(user);
			userService.checkGeslo.mockResolvedValue(false);
			await userCtrl.login(req, res, next);
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				message: "Napačen email ali geslo",
			});
		});
		it("should call next on error", async () => {
			const err = new Error();
			userService.getUserByEmail.mockRejectedValue(err);
			await userCtrl.login(req, res, next);
			expect(next).toHaveBeenCalledWith(err);
		});
	});

	describe("loginAdmin", () => {
		it("should login admin successfully", async () => {
			const user = { email: "admin@b.com" };
			req.body = { email: "admin@b.com", geslo: "pw" };
			userService.getUserByEmailAndType.mockResolvedValue(user);
			userService.checkGeslo.mockResolvedValue(true);
			jwt.sign.mockReturnValue("admintoken");
			await userCtrl.loginAdmin(req, res, next);
			expect(res.cookie).toHaveBeenCalledWith("token", "admintoken", {
				httpOnly: true,
			});
			expect(res.json).toHaveBeenCalledWith({ message: "Prijava uspešna" });
		});
		it("should fail if admin not found", async () => {
			req.body = { email: "admin@b.com", geslo: "pw" };
			userService.getUserByEmailAndType.mockResolvedValue(null);
			await userCtrl.loginAdmin(req, res, next);
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				message: "Napačen email ali geslo",
			});
		});
		it("should fail if password is wrong", async () => {
			const user = { email: "admin@b.com" };
			req.body = { email: "admin@b.com", geslo: "pw" };
			userService.getUserByEmailAndType.mockResolvedValue(user);
			userService.checkGeslo.mockResolvedValue(false);
			await userCtrl.loginAdmin(req, res, next);
			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				message: "Napačen email ali geslo",
			});
		});
		it("should call next on error", async () => {
			const err = new Error();
			userService.getUserByEmailAndType.mockRejectedValue(err);
			await userCtrl.loginAdmin(req, res, next);
			expect(next).toHaveBeenCalledWith(err);
		});
	});

	describe("logout", () => {
		const OLD_ENV = process.env;
		beforeEach(() => {
			jest.resetModules();
			process.env = { ...OLD_ENV };
		});
		afterAll(() => {
			process.env = OLD_ENV;
		});
		it("should clear cookie and return message", () => {
			process.env.NODE_ENV = "development";
			userCtrl.logout(req, res);
			expect(res.clearCookie).toHaveBeenCalledWith(
				"token",
				expect.objectContaining({
					httpOnly: true,
					secure: false,
					sameSite: "lax",
					path: "/",
					domain: "localhost",
				})
			);
			expect(res.json).toHaveBeenCalledWith({ message: "Odjava uspešna" });
		});
		it("should use production options", () => {
			process.env.NODE_ENV = "production";
			process.env.COOKIE_DOMAIN = "example.com";
			userCtrl.logout(req, res);
			expect(res.clearCookie).toHaveBeenCalledWith(
				"token",
				expect.objectContaining({
					secure: true,
					domain: "example.com",
				})
			);
		});
	});

	describe("removeMultiple", () => {
		it("should remove multiple users", async () => {
			req.body = { ids: [1, 2, 3] };
			userService.deleteUsers.mockResolvedValue();
			await userCtrl.removeMultiple(req, res, next);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});
		it("should call next on error", async () => {
			const err = new Error();
			userService.deleteUsers.mockRejectedValue(err);
			await userCtrl.removeMultiple(req, res, next);
			expect(next).toHaveBeenCalledWith(err);
		});
	});
});
