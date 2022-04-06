const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const Users = require("../repository/users");
const { HttpCode } = require("../config/constant");
require("dotenv").config();

const UploadService = require("../services/cloud-upload");
const EmailService = require("../services/email/service");
const {
  CreateSenderSendGrid,
  CreateSenderNodemailer,
} = require("../services/email/sender");

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const signUp = async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await Users.findByEmail(email);
  if (user) {
    return res.status(HttpCode.CONFLICT).json({
      status: "error",
      code: HttpCode.CONFLICT,
      message: "Email is already in use",
    });
  }
  try {
    const newUser = await Users.create({ name, email, password });
    const emailService = new EmailService(
      process.env.NODE_ENV,
      new CreateSenderSendGrid()
    );
    const statusEmail = await emailService.sendVerifyEmail(
      newUser.email,
      newUser.name,
      newUser.verifyToken
    );
    return res.status(HttpCode.CREATED).json({
      status: "success",
      code: HttpCode.CREATED,
      data: {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        avatar: newUser.avatar,
        successEmail: statusEmail,
      },
    });
  } catch (e) {
    next(e);
  }
};

const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await Users.findByEmail(email);
  const isValidPassword = await user?.isValidPassword(password);
  if (!user || !isValidPassword || !user?.isVerified) {
    return res.status(HttpCode.UNAUTHORIZED).json({
      status: "error",
      code: HttpCode.UNAUTHORIZED,
      message: "Invalid credentials",
    });
  }
  const userId = user._id;
  const payload = { userId };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
  await Users.updateToken(userId, token);
  const { name, avatar } = user;
  return res.status(HttpCode.OK).json({
    status: "success",
    code: HttpCode.OK,
    data: {
      id: user.id,
      email,
      name,
      token,
      avatar,
    },
  });
};

const loginByGoogle = async (req, res) => {
  const { token } = req.body;
  const { id } = jwt.verify(token, SECRET_KEY);

  const user = await Users.findById(id);

  if (!user || user.token !== token)
    throw new CustomError(HttpCode.UNAUTHORIZED, "Invalid credentials");

  const { name, avatar, email } = user;

  return res.status(HttpCode.OK).json({
    status: "success",
    code: HttpCode.OK,
    data: {
      id,
      email,
      name,

      token,
      avatar,
    },
  });
};

const signOut = async (req, res, next) => {
  const id = req.user._id;
  await Users.updateToken(id, null);
  return res.status(HttpCode.NO_CONTENT).json({ test: "test" });
};

const uploadAvatar = async (req, res, next) => {
  const { id, idUserCloud } = req.user;
  const file = req.file;

  const destination = "Avatars";
  const uploadService = new UploadService(destination);
  const { avatarUrl, returnIdUserCloud } = await uploadService.save(
    file.path,
    idUserCloud
  );

  await Users.updateAvatar(id, avatarUrl, returnIdUserCloud);
  try {
    await fs.unlink(file.path);
  } catch (error) {
    console.log(error.message);
  }
  return res.status(HttpCode.OK).json({
    status: "success",
    code: HttpCode.OK,
    date: {
      avatar: avatarUrl,
    },
  });
};

const verifyUser = async (req, res, next) => {
  const user = await Users.findUserByVerifyToken(req.params.token);
  if (user) {
    await Users.updateTokenVerify(user._id, true, null);
    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      data: {
        message: "Success",
      },
    });
  }
  return res.status(HttpCode.BAD_REQUEST).json({
    status: "error",
    code: HttpCode.BAD_REQUEST,
    message: "Invalid token",
  });
};

const repeatEmailForVerifyUser = async (req, res, next) => {
  const { email } = req.body;
  const user = await Users.findByEmail(email);
  if (user) {
    const { email, name, verifyToken } = user;
    const emailService = new EmailService(
      process.env.NODE_ENV,
      new CreateSenderNodemailer()
    );
    const statusEmail = await emailService.sendVerifyEmail(
      email,
      name,
      verifyToken
    );
  }
  return res.status(HttpCode.OK).json({
    status: "success",
    code: HttpCode.OK,
    data: {
      message: "Success",
    },
  });
};

const current = async (req, res) => {
  const userId = req.user._id;
  const user = await Users.findById(userId);
  if (user) {
    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      message: "Current user",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  }
  throw new CustomError(HttpCode.NOT_FOUND, "Not Found");
};

module.exports = {
  signUp,
  signIn,
  signOut,
  uploadAvatar,
  verifyUser,
  repeatEmailForVerifyUser,
  current,
  loginByGoogle,
};
