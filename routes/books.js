const express = require("express");
const booksController = require("../controllers/booksController");
const authController = require("../controllers/authController");

const router = express.Router();

// these does not require user to be logged in / admins
router.get("/", booksController.getAllBooks);
router.get("/:id", booksController.getBook);
router.get("/lng/:lng", booksController.getBooksLang);

router.use(authController.protect, authController.adminsOnly); // requests below are only for admins

router.post("/", booksController.createBook);
router
	.route("/:id")
	.patch(booksController.updateBook)
	.delete(booksController.deleteBook);

module.exports = router;
