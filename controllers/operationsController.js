const AppError = require("../utils/appError");
const APIFeatures = require("../utils/APIFeatures");
const catchAsync = require("../utils/catchAsync");

// GET
exports.getAll = (Model) =>
	catchAsync(async (req, res, next) => {
		const features = new APIFeatures(Model.find(), req.query)
			.filter()
			.sort()
			.limitFields()
			.pagination();
		const docs = await features.query;

		res.status(200).json({
			status: "success",
			results: docs.length,

			data: docs,
		});
	});

exports.getOne = (Model, popOptions) =>
	catchAsync(async (req, res, next) => {
		let query = Model.findById(req.params.id);
		if (popOptions) query = query.populate(popOptions);

		const doc = await query;

		if (!doc) {
			return next(
				new AppError(
					req.t("errors.noID").replace(
						"{doc}",
						req.t(`errors.dbs.${Model.collection.name}`) // errors.dbs.books = book | كتاب
					),
					404
				)
			);
		}
		res.status(200).json({
			status: "success",

			data: doc,
		});
	});

// POST
exports.createOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.create(req.body);
		res.status(201).json({
			status: "success",

			data: doc,
		});
	});

// PATCH
exports.updateOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!doc) {
			return next(
				new AppError(
					req
						.t("errors.noID")
						.replace(
							"{doc}",
							req.t(`errors.dbs.${Model.collection.name}`)
						),
					404
				)
			);
		}

		res.status(200).json({
			status: "success",

			data: doc,
		});
	});

// DELETE
exports.deleteOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id);

		if (!doc) {
			return next(
				new AppError(
					req
						.t("errors.noID")
						.replace(
							"{doc}",
							req.t(`errors.dbs.${Model.collection.name}`)
						),
					404
				)
			);
		}
		res.status(204).json({
			status: "success",
			data: null,
		});
	});
