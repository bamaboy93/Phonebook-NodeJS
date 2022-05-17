const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  signUp,
  signIn,
  signOut,
  uploadAvatar,
  verifyUser,
  repeatEmailForVerifyUser,
  current,
  googleAuth,
  googleRedirect,
} = require("../../controllers/users");
const { validateRegistration, validateLogin } = require("./validation");

require("dotenv").config();

const guard = require("../../helpers/guard");
const loginLimit = require("../../helpers/rate-limit-login");
const upload = require("../../helpers/uploads");
const wrapError = require("../../helpers/error-handler");

router.post("/signup", validateRegistration, wrapError(signUp));
router.post("/signin", validateLogin, loginLimit, wrapError(signIn));
router.get("/google", wrapError(googleAuth));
router.get("/google-redirect", wrapError(googleRedirect));
router.post("/signout", guard, wrapError(signOut));

router.patch(
  "/avatar",
  guard,
  upload.single("avatar"),
  wrapError(uploadAvatar)
);
router.get("/current", guard, wrapError(current));
router.get("/verify/:token", wrapError(verifyUser));
router.post("/verify", repeatEmailForVerifyUser);

module.exports = router;
