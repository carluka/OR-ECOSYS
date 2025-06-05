const deviceService = require("../services/deviceService");
const PDFDocument = require("pdfkit");
const deviceRepo = require("../repositories/deviceRepo");

exports.getAll = async (req, res, next) => {
	try {
		const devices = await deviceService.listDevices();
		res.json({ data: devices });
	} catch (err) {
		next(err);
	}
};

exports.getById = async (req, res, next) => {
	try {
		const device = await deviceService.getDevice(req.params.id);
		res.json({ data: device });
	} catch (err) {
		next(err);
	}
};

exports.create = async (req, res, next) => {
	try {
		const newDevice = await deviceService.createDevice(req.body);
		res.status(201).json({ data: newDevice });
	} catch (err) {
		next(err);
	}
};

exports.update = async (req, res, next) => {
	try {
		await deviceService.updateDevice(req.params.id, req.body);
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

exports.remove = async (req, res, next) => {
	try {
		await deviceService.deleteDevice(req.params.id);
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

exports.togglePower = async (req, res, next) => {
	try {
		const { action } = req.body;
		await deviceService.togglePower(req.params.id, action);
		res.status(200).json({ message: `Device ${action}` });
	} catch (err) {
		next(err);
	}
};

exports.removeMultiple = async (req, res, next) => {
	try {
		const { ids } = req.body;
		await deviceService.deleteDevices(ids);
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

exports.prikaz = async (req, res, next) => {
	try {
		const { tip_naprave, servis } = req.query;
		const devices = await deviceService.getDevices({ tip_naprave, servis });
		res.json({ data: devices });
	} catch (err) {
		next(err);
	}
};

exports.reportData = async (req, res, next) => {
	try {
		const id = req.params.id;
		const data = await deviceService.getDeviceReportData(id);
		res.json({ data });
	} catch (err) {
		next(err);
	}
};

// Generate a pdf file for device

exports.reportPDF = async (req, res, next) => {
	try {
		const { id } = req.params;
		const device = await deviceRepo.getReportData(id);

		if (!device) {
			return res.status(404).send("Device not found.");
		}

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=report-device-${id}.pdf`
		);

		const doc = new PDFDocument({ margin: 40 });
		doc.pipe(res);

		// --- Margin helpers ---
		const left = doc.page.margins.left; // 40
		const right = doc.page.width - doc.page.margins.right; // 595 - 40 = 555
		const tableWidth = right - left; // 555 - 40 = 515

		// ===== Title =====
		doc
			.font("Helvetica-Bold")
			.fontSize(24)
			.text(`Device Report: ${device.naziv || "N/A"}`, {
				align: "center",
				underline: false,
			})
			.moveDown(1.2);

		// ===== Section Divider =====
		doc
			.moveTo(left, doc.y)
			.lineTo(right, doc.y)
			.strokeColor("#d1d5db")
			.lineWidth(2)
			.stroke()
			.moveDown(1.2);

		// ===== Device Info Table =====
		doc
			.fontSize(15)
			.font("Helvetica-Bold")
			.text("Device Information", left, doc.y, { align: "left" });
		doc.moveDown(0.5);

		const tableStartY = doc.y;
		const rowHeight = 26,
			labelWidth = 160,
			valueWidth = 335;
		const infoRows = [
			["Device Name", device.naziv || "N/A"],
			["Device Type", device.tip_naprave || "N/A"],
			["Room", device.soba_naziv || "No room"],
			["Room Location", device.soba_lokacija || "No location"],
			["Serviced in last 2 months", device.servis ? "YES" : "NO"],
		];

		infoRows.forEach(([label, value], idx) => {
			const y = tableStartY + idx * rowHeight;
			// background
			doc
				.rect(left, y, tableWidth, rowHeight)
				.fill(idx === 0 ? "#f9fafb" : idx % 2 ? "#f3f4f6" : "#fff")
				.fillColor("black");
			// left: label
			doc
				.font("Helvetica-Bold")
				.fontSize(12)
				.fillColor("#222")
				.text(label, left + 10, y + 7, { width: labelWidth - 10 });
			// right: value
			doc
				.font("Helvetica")
				.fontSize(12)
				.fillColor("#111")
				.text(value, left + 10 + labelWidth, y + 7, { width: valueWidth - 10 });
			// border line
			doc
				.moveTo(left, y + rowHeight)
				.lineTo(right, y + rowHeight)
				.strokeColor("#e5e7eb")
				.lineWidth(1)
				.stroke();
		});

		doc.moveDown(3.5);

		// ===== Services Table =====
		doc
			.font("Helvetica-Bold")
			.fontSize(15)
			.fillColor("#222")
			.text("Services", left, doc.y, { align: "left" });
		doc.moveDown(0.7);

		let y = doc.y;
		// Table header
		doc.roundedRect(left, y, tableWidth, rowHeight, 6).fill("#e5e7eb");
		doc
			.font("Helvetica-Bold")
			.fontSize(12)
			.fillColor("#222")
			.text("No.", left + 12, y + 8, { width: 28, align: "left" })
			.text("Date", left + 50, y + 8, { width: 80, align: "left" })
			.text("Time", left + 140, y + 8, { width: 80, align: "left" })
			.text("Comment", left + 230, y + 8, {
				width: tableWidth - 230 - 10,
				align: "left",
			});

		y += rowHeight;

		if (Array.isArray(device.servisi) && device.servisi.length > 0) {
			device.servisi.forEach((s, idx) => {
				doc
					.roundedRect(left, y, tableWidth, rowHeight, 6)
					.fill(idx % 2 ? "#f9fafb" : "#fff");
				doc
					.font("Helvetica")
					.fontSize(12)
					.fillColor("#222")
					.text(idx + 1, left + 12, y + 8, { width: 28 })
					.text(s.datum || "", left + 50, y + 8, { width: 80 })
					.text(s.ura || "", left + 140, y + 8, { width: 80 })
					.text(s.komentar || "", left + 230, y + 8, {
						width: tableWidth - 230 - 10,
					});
				y += rowHeight;
			});
			doc.y = y + 10;
		} else {
			doc
				.font("Helvetica-Oblique")
				.fontSize(12)
				.text("No services have been recorded.", left + 12, y + 8);
			doc.y = y + rowHeight;
		}

		doc.moveDown(2);

		// ===== Section Divider =====
		doc
			.moveTo(left, doc.y)
			.lineTo(right, doc.y)
			.strokeColor("#d1d5db")
			.lineWidth(2)
			.stroke();
		doc.moveDown(1.2);

		// ===== Operations Table =====
		doc
			.font("Helvetica-Bold")
			.fontSize(15)
			.fillColor("#222")
			.text("Operations in this room:", left, doc.y, { align: "left" });
		doc.moveDown(0.7);

		y = doc.y;
		// Table header
		doc.roundedRect(left, y, tableWidth, rowHeight, 6).fill("#e5e7eb");
		doc
			.font("Helvetica-Bold")
			.fontSize(12)
			.fillColor("#222")
			.text("No.", left + 12, y + 8, { width: 28 })
			.text("Date", left + 50, y + 8, { width: 80 })
			.text("Start Time", left + 140, y + 8, { width: 80 })
			.text("End Time", left + 230, y + 8, { width: 80 });

		y += rowHeight;

		if (Array.isArray(device.operacije) && device.operacije.length > 0) {
			device.operacije.forEach((op, idx) => {
				doc
					.roundedRect(left, y, tableWidth, rowHeight, 6)
					.fill(idx % 2 ? "#f9fafb" : "#fff");
				doc
					.font("Helvetica")
					.fontSize(12)
					.fillColor("#222")
					.text(idx + 1, left + 12, y + 8, { width: 28 })
					.text(op.datum || "", left + 50, y + 8, { width: 80 })
					.text(op.cas_zacetka || "", left + 140, y + 8, { width: 80 })
					.text(op.cas_konca || "", left + 230, y + 8, { width: 80 });
				y += rowHeight;
			});
			doc.y = y + 10;
		} else {
			doc
				.font("Helvetica-Oblique")
				.fontSize(12)
				.text(
					"No operations have been recorded in this room.",
					left + 12,
					y + 8
				);
			doc.y = y + rowHeight;
		}

		doc.end();
	} catch (err) {
		next(err);
	}
};
