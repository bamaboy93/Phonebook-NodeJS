const db = require("../config/db");
const app = require("../app");

const result = require("dotenv").config();

const UPLOAD_DIR = process.env.UPLOAD_DIR;
const AVATAR_OF_USER = process.env.AVATAR_OF_USERS;
const mkdirp = require("mkdirp");
if (result.error) {
  throw result.error;
}

const PORT = process.env.PORT || 3000;

db.then(() => {
  app.listen(PORT, () => {
    mkdirp(UPLOAD_DIR);
    mkdirp(AVATAR_OF_USER);
    console.log(`Server running. Use our API on port: ${PORT}`);
  });
}).catch((err) => {
  console.log(`Server not run. Error: ${err.message}`);
});
