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
			set: jest.fn().mockReturnThis(),
		};
		next = jest.fn();
		jest.clearAllMocks();
	});

	describe("login", () => {
		it("should login successfully", async () => {
			const user = { email: "a@b.com" };
			req.body = { email: "a@b.com", geslo: "pw" };
			userService.getUserByEmail.mockResolvedValue(user);
			userService.checkGeslo.mockResolvedValue(true);
			jwt.sign.mockReturnValue("token123");
			await userCtrl.login(req, res, next);
			expect(res.cookie).toHaveBeenCalledWith(
				"token",
				"token123",
				expect.objectContaining({
					httpOnly: true,
					path: "/",
					sameSite: "lax",
					secure: false,
				})
			);
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
			expect(res.cookie).toHaveBeenCalledWith(
				"token",
				"admintoken",
				expect.objectContaining({
					httpOnly: true,
					path: "/",
					sameSite: "lax",
					secure: false,
				})
			);
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
			res.set = jest.fn().mockReturnThis();
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
