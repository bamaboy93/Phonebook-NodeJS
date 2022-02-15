const express = require("express");
const router = express.Router();
const {
  registration,
  login,
  logout,
  getCurrent,
  uploadAvatar,
} = require("../../controllers/users");
const guard = require("../../helpers/guard");
const { validateUser } = require("./validation");
const loginLimit = require("../../helpers/rate-limit-login");
const upload = require("../../helpers/uploads");

router.post("/registration", validateUser, registration);

router.post("/login", validateUser, loginLimit, login);

router.post("/logout", guard, logout);

router.post("/current", guard, getCurrent);

router.patch("/avatar", guard, upload.single("avatar"), uploadAvatar);

module.exports = router;
