const mongoose = require("mongoose");

require("dotenv").config();

const uri = process.env.URI_DB;

const db = mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Mongoose connection to DB");
});

mongoose.connection.on("error", (err) => {
  console.log(`Mongoose connection error ${err.message}`);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("DB connection closed");
  process.exit();
});

module.exports = db;
