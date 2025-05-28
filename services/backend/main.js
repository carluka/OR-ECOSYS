require("dotenv").config();
process.env.NODE_ENV = process.env.NODE_ENV || "development";
console.log("Environment:", process.env.NODE_ENV);

const http = require("http");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const config = require("./config");
const { sequelize } = require("./db/database");
const createRoutes = require("./routes");
const { errorHandler } = require("./middlewares/errorHandler");
const { cookieJwtAuth } = require("./middlewares/auth");
const { login, loginAdmin } = require("./controllers/userCtrl");

// HTTP Express server
const app = express();
const server = http.createServer(app);

// --- MIDDLEWARES ---
const corsOptions = {
	origin: function (origin, callback) {
		const allowedOrigins = [
			"http://localhost:3001",
			"http://localhost:3002",
			"http://or-ecosystem.eu",
			"http://data.or-ecosystem.eu",
			"http://admin.or-ecosystem.eu",
			"https://or-ecosystem.eu",
			"https://data.or-ecosystem.eu",
			"https://admin.or-ecosystem.eu",
		];
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	exposedHeaders: ["Set-Cookie"],
};

console.log("CORS options:", corsOptions);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Public available routes
app.post("/api/users/login", login);
app.post("/api/users/loginAdmin", loginAdmin);

app.get("/api/check", cookieJwtAuth, (req, res) => {
	res.send(true);
});

// Global authentication middleware
app.use(cookieJwtAuth);

// --- ROUTES ---
app.use("/api", createRoutes());

// --- ERROR HANDLER ---
app.use(errorHandler);

// --- DATABASE & SERVER STARTUP ---
(async () => {
	try {
		await sequelize.authenticate();
		console.log("Database connected");

		server.listen(config.port, () => {
			console.log(`Server listening on port ${config.port}`);
		});
	} catch (err) {
		console.error("Database connection error", err);
		process.exit(1);
	}
})();
