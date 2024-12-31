const mongoose = require("mongoose");
const slugify = require("slugify");

const authorSchema = new mongoose.Schema(
	{
		en: {
			name: {
				type: String,
				required: [true, "Please write the author's name"],
				minlength: [8, "Author's name must be 8 characters or more"],
				maxlength: [30, "Author's name must be 30 characters or less"],
				trim: true,
				unique: true,
			},
			about: {
				type: String,
				default: "there is no info about this author",
			},
		},
		ar: {
			name: {
				type: String,
				minlength: [2, "Author's name must be 8 characters or more"],
				maxlength: [30, "Author's name must be 30 characters or less"],
				trim: true,
				unique: true,
			},
			about: {
				type: String,
				default: "لا توجد معلومات حول هذا الكاتب",
			},
		},
		photo: {
			type: String,
			default: "default.jpg",
		},
		slug: String,
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
	{ timestamps: true }
);

authorSchema.virtual("books", {
	ref: "Book",
	localField: "_id",
	foreignField: "author",
});

authorSchema.pre("save", function (next) {
	if (!this.slug)
		this.slug = slugify(this.en.name, { lower: true, strict: true });
	next();
});

authorSchema.pre("findOneAndUpdate", async function (next) {
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

module.exports = mongoose.model("Author", authorSchema);
