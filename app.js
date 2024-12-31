const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
// const passport = require("passport"); // Later
const path = require("path");
const books = require("./routes/books");
const authors = require("./routes/authors");
const genres = require("./routes/genres");
const users = require("./routes/users");
const views = require("./routes/views");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

// i18n for translations
const i18n = require("i18next");
const i18nBackend = require("i18next-fs-backend");
const i18nMiddleware = require("i18next-http-middleware");

i18n.use(i18nBackend)
	.use(i18nMiddleware.LanguageDetector)
	.init({
		backend: {
			loadPath: __dirname + "/locales/{{lng}}/{{ns}}.json",
		},
		detection: {
			order: ["querystring", "cookie"], // Priority: URL query string first, then cookies
			caches: ["cookie"],
		},
		fallbackLng: "en",
		preload: ["ar", "en"],
	});

const app = express();

app.use(i18nMiddleware.handle(i18n));

// Middleware to change language
app.use((req, res, next) => {
	res.locals.lng = req.language;
	next();
});

// Views
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// MIDDLEWARES
app.use(morgan("dev"));
// - body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
// ROUTES
app.use("/", views);
app.use("/api/v1/books", books);
app.use("/api/v1/authors", authors);
app.use("/api/v1/genres", genres);
app.use("/api/v1/users", users);

app.get("/favicon.ico", (req, res) => res.status(204)); // Now favicon won't be 404 on api calls

app.all("*", (req, res, next) => {
	next(new AppError(req.t("errors.notFound"), 404));
});

app.use(globalErrorHandler);

module.exports = app;
