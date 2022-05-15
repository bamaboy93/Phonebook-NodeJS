const app = require("../app");
const db = require("../config/db");
require("dotenv").config();
const UPLOAD_DIR = process.env.UPLOAD_DIR;
const AVATAR_OF_USERS = process.env.AVATAR_OF_USERS;
const mkdirp = require("mkdirp");

require("dotenv").config();
const PORT = process.env.PORT || 3000;

db.then(() => {
  app.listen(PORT, async () => {
    await mkdirp(UPLOAD_DIR);
    await mkdirp(AVATAR_OF_USERS);
    console.log(`Server is running. Use our API on port: ${PORT}`);
  });
}).catch((err) => {
  console.log(`Server failed to run. Error: ${err.message}`);
});
