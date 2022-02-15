const Users = require("../repository/users");
const jwt = require("jsonwebtoken");
const path = require("path");
const mkdirp = require("mkdirp");
const UploadService = require("../services/file-upload");
const { HttpCode } = require("../config/constant");
require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;

const registration = async (req, res, next) => {
  const { password, email, subscription } = req.body;
  const user = await Users.findByEmail(req.body.email);
  if (user) {
    return res.status(HttpCode.CONFLICT).json({
      status: "error",
      code: HttpCode.CONFLICT,
      message: "Email is already used",
    });
  }
  try {
    const newUser = await Users.create({ password, email, subscription });
    return res.status(HttpCode.CREATED).json({
      status: "success",
      code: HttpCode.CREATED,
      data: {
        id: newUser.id,
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await Users.findByEmail(email);

  const isValidPassword = await user.isValidPassword(password);
  if (!user || !isValidPassword) {
    return res.status(HttpCode.UNAUTHORIZED).json({
      status: "error",
      code: HttpCode.UNAUTHORIZED,
      message: "Email or password is wrong",
    });
  }

  const id = user._id;
  const payload = { id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
  await Users.updateToken(id, token);

  return res.status(HttpCode.OK).json({
    status: "success",
    code: HttpCode.OK,
    data: {
      token: token,
      user: {
        email: email,
        subscription: user.subscription,
      },
    },
  });
};

const logout = async (req, res, next) => {
  const id = req.user._id;
  const user = await Users.findById(id);
  if (!user) {
    return res.status(HttpCode.UNAUTHORIZED).json({
      status: "error",
      code: HttpCode.UNAUTHORIZED,
      message: "Not authorized",
    });
  }
  await Users.updateToken(id, null);
  return res.status(HttpCode.NO_CONTENT).json({ status: "No Content" });
};

const getCurrent = async (req, res, next) => {
  const id = req.user._id;
  const user = await Users.findById(id);
  if (!user) {
    return res.status(HttpCode.UNAUTHORIZED).json({
      status: "error",
      code: HttpCode.UNAUTHORIZED,
      message: "Not authorized",
    });
  }

  return res.status(HttpCode.OK).json({
    status: "success",
    code: HttpCode.OK,
    data: { email: user.email, subscription: user.subscription },
  });
};

const uploadAvatar = async (req, res, next) => {
  const id = String(req.user._id);
  const file = req.file;
  const AVATAR_OF_USER = process.env.AVATAR_OF_USER;
  const dest = path.join(AVATAR_OF_USER, id);
  await mkdirp(dest);
  const uploadService = new UploadService(dest);
  const avatarUrl = await uploadService.save(file, id);
  await Users.updateAvatar(id, avatarUrl);
  return res.status(HttpCode.OK).json({
    status: "success",
    code: HttpCode.OK,
    data: { avatar: avatarUrl },
  });
};

module.exports = {
  registration,
  login,
  logout,
  getCurrent,
  uploadAvatar,
};
