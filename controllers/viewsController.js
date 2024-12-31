const axios = require("axios");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

/*
TODO:
pages to make:
	1- homepage [✅️]
    2- books [✅️]
    3- book [✅️]
    4- authors [✅️]
    5- author [✅️]
    6- login [✅️]
    7- signup [✅️]
	8- search
	9- genres
	10- genre
*/

const getBooks = async (lng, search, limit, page) => {
	search = search || "";
	const array = await axios.get(
		`http://localhost:5000/api/v1/books/lng/${lng}?search=${search}&limit=${limit}&page=${page}`
	);
	const books = await array.data;
	return books.data;
};

const getAuthors = async (lng, search, limit, page) => {
	search = search || "";
	const array = await axios.get(
		`http://localhost:5000/api/v1/authors/lng/${lng}?search=${search}&limit=${limit}&page=${page}`
	);
	const authors = await array.data;
	return authors.data;
};

const getGenres = async (lng, search, limit, page) => {
	search = search || "";
	const array = await axios.get(
		`http://localhost:5000/api/v1/genres/lng/${lng}?search=${search}&limit=${limit}&page=${page}`
	);
	const genres = await array.data;
	return genres.data;
};

exports.getHomepage = catchAsync(async (req, res, next) => {
	const books = (await getBooks(req.language, "", 10)).books;
	res.status(200).render("pages/homepage", {
		books,
		app: req.t("app", { returnObjects: true }),
		page: req.t("homepage", { returnObjects: true }),
	});
});

exports.getAllBooks = catchAsync(async (req, res, next) => {
	const books = (await getBooks(req.language)).books;
	let page = { title: req.t("app.books") };
	res.status(200).render("pages/books", {
		books,
		app: req.t("app", { returnObjects: true }),
		page,
	});
});

exports.getBook = catchAsync(async (req, res, next) => {
	const { slug } = req.params;
	const book = (await getBooks(req.language, slug)).books[0];

	// Translate languages names
	for (let i = 0; i < book.languages.length; i++) {
		book.languages[i] = req.t(`languages.${book.languages[i]}`);
	}

	if (!book) {
		return next(new AppError(req.t("errors.notFound"), 404));
	}
	const page = req.t("bookPage", { returnObjects: true });
	page.title = book.title;
	res.status(200).render("pages/book", {
		book,
		app: req.t("app", { returnObjects: true }),
		page,
	});
});
exports.getAllAuthors = catchAsync(async (req, res) => {
	const authors = (await getAuthors(req.language)).authors;
	let page = { title: req.t("app.authors") };
	res.status(200).render("pages/authors", {
		authors,
		app: req.t("app", { returnObjects: true }),
		page,
	});
});

exports.getAuthor = catchAsync(async (req, res) => {
	const { slug } = req.params;
	const author = (await getAuthors(req.language, slug)).authors[0];
	let page = { title: author.name };
	res.status(200).render("pages/author", {
		author,
		app: req.t("app", { returnObjects: true }),
		page,
	});
});

exports.getAllGenres = catchAsync(async (req, res) => {
	const genres = (await getGenres(req.language)).genres;
	let page = { title: req.t("app.genres") };
	res.status(200).render("pages/genres", {
		genres,
		app: req.t("app", { returnObjects: true }),
		page,
	});
});

exports.getGenre = catchAsync(async (req, res) => {
	const { slug } = req.params;
	const genre = (await getGenres(req.language, slug)).genres[0];
	let page = { title: genre.name };
	res.status(200).render("pages/genre", {
		genre,
		app: req.t("app", { returnObjects: true }),
		page,
	});
});

// LOGIN AND SIGNUP
exports.login = catchAsync(async (req, res) => {
	res.status(200).render("pages/login", {
		app: req.t("app", { returnObjects: true }),
		page: req.t("loginPage", { returnObjects: true }),
	});
});
exports.signup = catchAsync(async (req, res) => {
	res.status(200).render("pages/signup", {
		app: req.t("app", { returnObjects: true }),
		page: req.t("signupPage", { returnObjects: true }),
	});
});
