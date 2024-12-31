class APIFeatures {
	// query = database query, queryStr = req.query
	constructor(query, queryStr) {
		(this.query = query), (this.queryStr = queryStr);
	}

	addLanguageSupport(parsedQuery, field) {
		if (parsedQuery[field]) {
			parsedQuery.$or = [
				{
					[`en.${field}`]: {
						$regex: parsedQuery[field],
						$options: "i",
					},
				},
				{
					[`ar.${field}`]: {
						$regex: parsedQuery[field],
						$options: "i",
					},
				},
			];
			delete parsedQuery[field]; // Remove the original field to avoid conflicts
		}
	}

	filter() {
		const queryObj = { ...this.queryStr };
		const excludedFields = ["page", "sort", "limit", "fields"];
		excludedFields.forEach((el) => delete queryObj[el]);

		// Advanced Filtering
		const queryStr = JSON.stringify(queryObj).replace(
			/\b(gte|gt|lte|lt)\b/g,
			(match) => `$${match}`
		);

		const parsedQuery = JSON.parse(queryStr);

		if (parsedQuery.title) this.addLanguageSupport(parsedQuery, "title");
		if (parsedQuery.name) this.addLanguageSupport(parsedQuery, "name");

		this.query = this.query.find(parsedQuery);

		return this;
	}

	sort() {
		if (this.queryStr.sort) {
			const sortBy = this.queryStr.sort.replaceAll(",", " ");
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort("-createdAt");
		}

		return this;
	}

	limitFields() {
		if (this.queryStr.fields) {
			this.query = this.query.select(
				this.queryStr.fields.replaceAll(",", " ")
			);
		} else {
			this.query = this.query.select("-__v");
		}
		return this;
	}

	pagination() {
		const page = +this.queryStr.page || 1;
		const limit = +this.queryStr.limit || 100;
		const skip = (page - 1) * limit;

		this.query = this.query.skip(skip).limit(limit);

		return this;
	}
}

module.exports = APIFeatures;
