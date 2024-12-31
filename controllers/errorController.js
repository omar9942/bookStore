const { JsonWebTokenError } = require("jsonwebtoken");
const AppError = require("./../utils/appError");

const validationError = (err, req) => {
	const props = Object.values(err.errors)[0].properties;

	if (props.type === "enum" || props.type === "user defined") {
		// enum returns "{path}.0" (or another number)
		const path = props.path.split(".")[0];
		return new AppError(
			req
				.t(`errors.${props.type}.${path}`)
				.replace("{value}", props.value),
			400
		);
	}

	return new AppError(
		req
			.t(`errors.${props.type}`)
			.replace("{path}", req.t(`errors.fields.${props.path}`)) // errors.fields.price = السعر
			.replace("{value}", props[props.type]), // for example: props.min = 0;
		400
	);
};

const duplicateError = (err, req) => {
	const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
	return new AppError(
		req.t(`errors.duplicate`).replace("{value}", value),
		400
	);
};

const castError = (err, req) => {
	let value = err.value;
	if (!value) {
		value = Object.values(err.errors)[0].reason.value;
	}
	return new AppError(
		req.t("errors.castError").replace("{value}", value),
		400
	);
};

const JWTErrors = (err, req) => {
	return new AppError(req.t("errors.jwtError"), 401);
};

const devError = (err, req, res) => {
	// A) API
	if (req.originalUrl.startsWith("/api")) {
		return res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack,
		});
	}
};

const prodError = (err, req, res) => {
	// 1) API
	if (req.originalUrl.startsWith("/api")) {
		if (err.isOperational) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			});
		}
		console.error("Error 💥️", err);
		return res.status(500).json({
			status: "error",
			message: req.t("errors.somethingWrong"),
		});
	}

	// 2) RENDERED WEBSITE
	// A) Operational, trusted error: send message to client
	if (err.isOperational) {
		return res.status(err.statusCode).render("pages/error", {
			app: req.t("app", { returnObjects: true }),
			page: req.t("errorPage", { returnObjects: true }),
			msg: err.message,
			code: err.statusCode,
		});
	}
	// B) Programming or other unknown error: don't leak error details
	console.log(err);
	return res.status(err.statusCode).render("pages/error", {
		msg: req.t("errors.somethingWrong"),
		code: err.statusCode,
	});
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";
	console.log(err);
	console.log(err.name);

	if (process.env.NODE_ENV === "development") {
		devError(err, req, res);
	} else if (process.env.NODE_ENV === "production") {
		if (err.isOperational) {
			return prodError(err, req, res);
		}
		// JWT ERRORS
		if (err instanceof JsonWebTokenError) {
			err = JWTErrors(err, req);
			return prodError(err, req, res);
		}
		// DB ERRORS
		let kind = err.code || err.kind || Object.values(err.errors)[0].kind;
		console.log(kind);
		switch (kind) {
			case 11000:
				err = duplicateError(err, req);
				break;
			case "ObjectId":
			case "[ObjectId]":
				err = castError(err, req);
				break;
			default:
				err = validationError(err, req);
		}
		prodError(err, req, res);
		next();
	}
};

// ValidatorError: has kind inside errors
// CastError: has kind: ObjectId || [ObjectId]
// dublicate: has code : 11000
