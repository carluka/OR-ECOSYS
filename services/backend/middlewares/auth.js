// middlewares/auth.js
const jwt = require("jsonwebtoken");

module.exports = function authenticateJWT(req, res, next) {
	const header = req.headers.authorization;
	if (!header?.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Token manjkajoč" });
	}
	const token = header.split(" ")[1];

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = payload; // { id, tip, email, iat, exp }
		next();
	} catch (err) {
		return res.status(403).json({ message: "Neveljaven token" });
	}
};
