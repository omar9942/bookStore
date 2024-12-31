const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });
const mongoose = require("mongoose");
const Book = require("../models/bookModel");
const Genre = require("../models/genreModel");
const Author = require("../models/authorModel");
const fs = require("fs");

mongoose.connect(process.env.DATABASE).then("DB connection was successful");

// files
const books = JSON.parse(fs.readFileSync(`${__dirname}/books.json`));
const genres = JSON.parse(fs.readFileSync(`${__dirname}/genres.json`));
const authors = JSON.parse(fs.readFileSync(`${__dirname}/authors.json`));

const deleteData = async (data) => {
	try {
		if (data === "books") {
			await Book.deleteMany();
		} else if (data === "genres") {
			await Genre.deleteMany();
		} else if (data === "authors") {
			await Author.deleteMany();
		}
		console.log("Data deleted successfully!");
	} catch (err) {
		console.log(err.message);
	}
	process.exit();
};

const importData = async (data) => {
	try {
		if (data === "books") {
			await Book.create(books);
		} else if (data === "genres") {
			await Genre.create(genres);
		} else if (data === "authors") {
			await Author.create(authors);
		} else {
			console.log("this model does not exist yet!");
			process.exit(1);
		}
		console.log("Data loaded successfully");
	} catch (err) {
		console.log(err.message);
	}
	process.exit();
};

if (process.argv.length < 3) {
	("There should be 2 arguments 1- Method 2- Model");
}
if (process.argv[2] === "--import") {
	importData(process.argv[3]);
} else if (process.argv[2] === "--delete") {
	deleteData(process.argv[3]);
} else {
	console.log("There is only '--import' & '--delete'");
	process.exit(1);
}
