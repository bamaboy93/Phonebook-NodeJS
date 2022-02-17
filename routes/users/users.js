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
  loginByGoogle,
} = require("../../controllers/users");
const {
  validateRegistration,
  validateLogin,
  validateLoginByGoogle,
} = require("./validation");

require("dotenv").config();
require("../../helpers/google-auth");
const guard = require("../../helpers/guard");
const loginLimit = require("../../helpers/rate-limit-login");
const upload = require("../../helpers/uploads");
const wrapError = require("../../helpers/error-handler");

router.post("/signup", validateRegistration, wrapError(signUp));
router.post("/signin", validateLogin, loginLimit, wrapError(signIn));
router.post("/loginByGoogle", validateLoginByGoogle, wrapError(loginByGoogle));
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

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/google/callback", passport.authenticate("google"), (req, res) => {
  const token = req.user.token;
  res.redirect(`${process.env.LINK}?token=${token}`);
});

module.exports = router;
