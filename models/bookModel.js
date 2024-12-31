const mongoose = require("mongoose");
const slugify = require("slugify");

const bookSchema = new mongoose.Schema(
	{
		en: {
			title: {
				type: String,
				required: [true, "The English title is required!"],
				minlength: 2,
				maxlength: 50,
				trim: true,
				unique: true,
			},
			description: {
				type: String,
				default: "This book doesn't have a description",
			},
		},
		ar: {
			title: {
				type: String,
				minlength: 2,
				maxlength: 80,
				trim: true,
			},
			description: {
				type: String,
				default: "هذا الكتاب ليس له وصف",
			},
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Author",
			required: true,
		},
		languages: {
			type: [String],
			enum: ["English", "Arabic", "French", "Spanish", "Chinese"],
			required: true,
			validate: {
				validator: function (v) {
					return v && v.length > 0; // Ensure array is not empty
				},
				message: "You have to specify the available languages!",
			},
		},
		pages: {
			type: Number,
			required: [true, "Please write how many pages the book has!"],
			min: [1, "Book can't have 0 or less pages!"],
		},
		year: {
			type: Number,
			max: [
				new Date().getFullYear(),
				"Year must not exceed the current year!",
			],
			min: [100, "Year can't be less than 100"],
			required: [true, "Please provide the publication year!"],
		},
		cover: {
			type: String,
			default: "default.jpg",
		},
		price: {
			type: Number,
			required: [true, "Please specify the price of the book!"],
			min: [0, "Book price can't be less than 0!"],
		},
		genres: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Genre",
			},
		],
		slug: String,
	},
	{ timestamps: true }
);

bookSchema.pre("save", function (next) {
	if (!this.slug)
		this.slug = slugify(this.en.title, { lower: true, strict: true });
	// if genres = [] then genres = Genreless
	if (this.genres.length === 0) this.genres = ["674c524bab865157897eba02"];
	next();
});

bookSchema.pre("findOneAndUpdate", async function (next) {
	const update = this.getUpdate();
	// Check if the English title is being updated
	if (update["en.title"]) {
		update["slug"] = slugify(update["en.title"], {
			lower: true,
			strict: true,
		});
	}
	this.setUpdate(update);
	next();
});

bookSchema.pre(/^find/, function (next) {
	// Check if `genres` or `author` is requested in the query
	const fields = this.select()?.["_fields"];

	if (!fields || fields.hasOwnProperty("-__v")) {
		this.populate({
			path: "author",
			select: "en.name ar.name",
		}).populate({
			path: "genres",
			select: "ar.name en.name",
		});
		return next();
	}

	if (fields.hasOwnProperty("author")) {
		this.populate({ path: "author", select: "en.name ar.name" });
	}

	if (fields.hasOwnProperty("genres")) {
		this.populate({ path: "genres", select: "ar.name en.name" });
	}

	next();
});

module.exports = mongoose.model("Book", bookSchema);
