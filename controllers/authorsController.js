const Author = require("../models/authorModel");
const operations = require("./operationsController");
const catchAsync = require("../utils/catchAsync");

// GET
exports.getAuthorsLang = catchAsync(async (req, res) => {
	let lang = req.params.lng;
	let search = req.query.search || "";
	// Paginaion
	const page = +req.query.page || 1;
	const limit = +req.query.limit || 100;
	const skip = (page - 1) * limit;

	const authorsAggregation = [
		{
			$lookup: {
				from: "books",
				localField: "_id",
				foreignField: "author",
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
				about: `$${lang}.about`,
				books: {
					$map: {
						input: "$books",
						as: "book",
						in: {
							title: {
								$ifNull: [
									`$$book.${lang}.title`,
									`$$book.en.title`,
								],
							},
							price: "$$book.price",
							cover: "$$book.cover",
							slug: "$$book.slug",
						},
					},
				},
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
				totalAuthors: { $sum: 1 },
				authors: { $push: "$$ROOT" },
			},
		},
		{
			$project: {
				totalAuthors: 1,
				authors: { $slice: ["$authors", skip, limit] }, // Paginate authors array
			},
		},
	];
	const result = await Author.aggregate(authorsAggregation);
	const totalAuthors = result[0]?.totalAuthors || 0;
	const authors = result[0]?.authors || [];

	res.status(200).json({
		status: "success",
		results: authors.length,
		data: {
			totalAuthors,
			authors,
		},
	});
});

exports.getAllAuthors = operations.getAll(Author);
exports.getAuthor = operations.getOne(Author, "books");
// POST
exports.createAuthor = operations.createOne(Author);
// PATCH
exports.updateAuthor = operations.updateOne(Author);
// DELETE
exports.deleteAuthor = operations.deleteOne(Author);
