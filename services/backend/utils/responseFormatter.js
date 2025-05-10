exports.success = (res, data, status = 200) => res.status(status).json({ data });
exports.error = (res, message, status = 500) => res.status(status).json({ error: message });