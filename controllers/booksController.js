const Book = require("../models/bookModel");
const operations = require("./operationsController");
const catchAsync = require("../utils/catchAsync");

// GET
exports.getBooksLang = catchAsync(async (req, res) => {
	let lang = req.params.lng;
	let search = req.query.search || "";
	// Paginaion
	const page = +req.query.page || 1;
	const limit = +req.query.limit || 100;
	const skip = (page - 1) * limit;

	const booksAggregation = [
		// Lookup & populate author and genres
		{
			$lookup: {
				from: "authors", // Name of the author collection
				localField: "author", // The field in Book schema
				foreignField: "_id", // The field in Author schema
				as: "author",
			},
		},
		{ $unwind: { path: "$author", preserveNullAndEmptyArrays: true } }, // Flatten the array
		{
			$lookup: {
				from: "genres", // Name of the genre collection
				localField: "genres", // The field in Book schema
				foreignField: "_id", // The field in Genre schema
				as: "genres",
			},
		},
		{
			$match: {
				$or: [
					{ slug: search },
					{ "en.title": { $regex: `${search}`, $options: "i" } }, // Search in English titles
					{ "ar.title": { $regex: `${search}`, $options: "i" } }, // Search in Arabic titles
				],
			},
		},
		{
			// dynamic language and fallback logic
			$project: {
				title: { $ifNull: [`$${lang}.title`, `$en.title`] },
				"author.name": {
					$ifNull: [`$author.${lang}.name`, `$author.en.name`],
				},
				"author.about": `$author.${lang}.about`,
				"author.slug": "$author.slug",
				genres: {
					$map: {
						input: "$genres",
						as: "genre",
						in: {
							name: {
								$ifNull: [
									`$$genre.${lang}.name`,
									`$$genre.en.name`,
								],
							},
							slug: "$$genre.slug",
						},
					},
				},
				description: `$${lang}.description`,
				year: 1,
				price: 1,
				pages: 1,
				languages: 1,
				cover: 1,
				slug: 1,
				createdAt: 1,
			},
		},
		{
			$group: {
				_id: null,
				totalBooks: { $sum: 1 },
				books: { $push: "$$ROOT" },
			},
		},
		{
			$project: {
				totalBooks: 1,
				books: { $slice: ["$books", skip, limit] }, // Paginate books array
			},
		},
		{ $sort: { createdAt: -1 } },
	];
	const result = await Book.aggregate(booksAggregation);
	const totalBooks = result[0]?.totalBooks || 0;
	const books = result[0]?.books || [];

	res.status(200).json({
		status: "success",
		results: books.length,
		data: {
			totalBooks,
			books,
		},
	});
});

exports.getAllBooks = operations.getAll(Book);
exports.getBook = operations.getOne(Book);
// POST
exports.createBook = operations.createOne(Book);
// PATCH
exports.updateBook = operations.updateOne(Book);
// DELETE
exports.deleteBook = operations.deleteOne(Book);
