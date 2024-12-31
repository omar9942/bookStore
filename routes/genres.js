const express = require("express");
const genresController = require("../controllers/genresController");
const authController = require("../controllers/authController");

const router = express.Router();

// these does not require user to be logged in / admins
router.get("/", genresController.getAllGenres);
router.get("/:id", genresController.getGenre);
router.get("/lng/:lng", genresController.getGenresLang);

router.use(authController.protect, authController.adminsOnly); // requests below are only for admins

router.post("/", genresController.createGenre);
router
	.route("/:id")
	.patch(genresController.updateGenre)
	.delete(genresController.deleteGenre);

module.exports = router;
