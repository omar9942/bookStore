const Genre = require("../models/genreModel");
const operations = require("./operationsController");
const catchAsync = require("../utils/catchAsync");

// GET
exports.getGenresLang = catchAsync(async (req, res) => {
	let lang = req.params.lng;
	let search = req.query.search || "";
	// Paginaion
	const page = +req.query.page || 1;
	const limit = +req.query.limit || 100;
	const skip = (page - 1) * limit;

	const genresAggregation = [
		{
			$lookup: {
				from: "books",
				localField: "_id",
				foreignField: "genres",
				pipeline: [
					{
						$lookup: {
							from: "authors", // Name of the author collection
							localField: "author", // The field in Book schema
							foreignField: "_id", // The field in Author schema
							as: "author",
						},
					},
					{
						$unwind: {
							path: "$author",
							preserveNullAndEmptyArrays: true,
						},
					},
					{
						$project: {
							title: { $ifNull: [`$${lang}.title`, `$en.title`] },
							"author.name": {
								$ifNull: [
									`$author.${lang}.name`,
									`$author.en.name`,
								],
							},
							"author.about": `$author.${lang}.about`,
							"author.slug": "$author.slug",
							cover: 1,
							slug: 1,
							price: 1,
						},
					},
				],
				as: "books",
			},
		},
		{
			$match: {
				$or: [
					{ slug: search },
					{ "en.name": { $regex: `${search}`, $options: "i" } }, // Search in English name
					{ "ar.name": { $regex: `${search}`, $options: "i" } }, // Search in Arabic name
				],
			},
		},
		{
			$addFields: {
				name: { $ifNull: [`$${lang}.name`, `$en.name`] },
			},
		},
		{
			$project: {
				en: 0,
				ar: 0,
				__v: 0,
			},
		},
		{
			$group: {
				_id: null,
				totalGenres: { $sum: 1 },
				genres: { $push: "$$ROOT" },
			},
		},
		{
			$project: {
				totalGenres: 1,
				genres: { $slice: ["$genres", skip, limit] }, // Paginate genres array
			},
		},
	];
	const result = await Genre.aggregate(genresAggregation);
	const totalGenres = result[0]?.totalGenres || 0;
	const genres = result[0]?.genres || [];

	res.status(200).json({
		status: "success",
		results: genres.length,
		data: {
			totalGenres,
			genres,
		},
	});
});

exports.getAllGenres = operations.getAll(Genre);
exports.getGenre = operations.getOne(Genre, "books");
// POST
exports.createGenre = operations.createOne(Genre);
// PATCH
exports.updateGenre = operations.updateOne(Genre);
// DELETE
exports.deleteGenre = operations.deleteOne(Genre);
