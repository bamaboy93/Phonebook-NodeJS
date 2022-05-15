const db = require("../config/db");
const app = require("../app");

require("dotenv").config();

const mkdirp = require("mkdirp");
const UPLOAD_DIR = process.env.UPLOAD_DIR;
const AVATAR_OF_USERS = process.env.AVATAR_OF_USERS;

const PORT = process.env.PORT || 3000;

db.then(() => {
  app.listen(PORT, async () => {
    mkdirp(UPLOAD_DIR);
    mkdirp(AVATAR_OF_USERS);
    console.log(`Server running. Use our API on port: ${PORT}`);
  });
}).catch((err) => {
  console.log(`Server not run. Error: ${err.message}`);
});
