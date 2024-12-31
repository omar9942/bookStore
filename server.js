const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app.js");
const mongoose = require("mongoose");

const DB = process.env.DATABASE;
const port = process.env.PORT || 5500;

mongoose.connect(DB).then(() => console.log("DB connection was successful!"));

const server = app.listen(port, () => {
	console.log(`listening on port ${port}...`);
	console.log(process.env.NODE_ENV);
});
