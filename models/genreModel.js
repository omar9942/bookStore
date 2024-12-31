const mongoose = require("mongoose");
const slugify = require("slugify");

const genreSchema = new mongoose.Schema(
	{
		en: {
			name: {
				type: String,
				required: [true, "Please write the gnere's name"],
				minlength: [2, "genre's name must be 2 characters or more"],
				maxlength: [20, "genre's name must be 20 characters or less"],
				trim: true,
				unique: true,
			},
		},
		ar: {
			name: {
				type: String,
				minlength: [2, "genre's name must be 2 characters or more"],
				maxlength: [20, "genre's name must be 20 characters or less"],
				trim: true,
			},
		},
		slug: String,
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// POPULATE THIS TOO
genreSchema.virtual("books", {
	ref: "Book",
	localField: "_id",
	foreignField: "genres",
});

genreSchema.pre("save", function (next) {
	if (!this.slug)
		this.slug = slugify(this.en.name, { lower: true, strict: true });
	next();
});

genreSchema.pre("findOneAndUpdate", async function (next) {
	const update = this.getUpdate();
	// Check if the English name is being updated
	if (update["en.name"]) {
		update["slug"] = slugify(update["en.name"], {
			lower: true,
			strict: true,
		});
	}
	this.setUpdate(update);
	next();
});

module.exports = mongoose.model("Genre", genreSchema);
