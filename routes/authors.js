const express = require("express");
const authorsController = require("../controllers/authorsController");
const authController = require("../controllers/authController");

const router = express.Router();

// these does not require user to be logged in / admins
router.get("/", authorsController.getAllAuthors);
router.get("/:id", authorsController.getAuthor);
router.get("/lng/:lng", authorsController.getAuthorsLang);

router.use(authController.protect, authController.adminsOnly); // requests below are only for admins

router.post("/", authorsController.createAuthor);
router
	.route("/:id")
	.patch(authorsController.updateAuthor)
	.delete(authorsController.deleteAuthor);

module.exports = router;
