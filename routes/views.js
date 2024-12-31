const express = require("express");
const viewsController = require("../controllers/viewsController");
const languageController = require("../controllers/languageController");
const router = express.Router();

router.get("/change-language", languageController.changeLanguage);

router.get("/", viewsController.getHomepage);

router.get("/books", viewsController.getAllBooks);
router.get("/books/:slug", viewsController.getBook);

router.get("/authors", viewsController.getAllAuthors);
router.get("/authors/:slug", viewsController.getAuthor);

router.get("/genres", viewsController.getAllGenres);
router.get("/genres/:slug", viewsController.getGenre);

router.get("/login", viewsController.login);
router.get("/signup", viewsController.signup);

module.exports = router;
