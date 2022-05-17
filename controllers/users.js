const axios = require("axios");
const queryString = require("query-string");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const Users = require("../repository/users");
const { HttpCode } = require("../config/constant");
require("dotenv").config();

// const UploadService = require("../services/cloud-upload");
const path = require("path");
const mkdirp = require("mkdirp");
const UploadService = require("../services/file-upload");

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
  const id = user._id;
  const payload = { id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "3h" });
  await Users.updateToken(id, token);
  const { name, avatar } = user;
  return res.status(HttpCode.OK).json({
    status: "success",
    code: HttpCode.OK,
    data: {
      id,
      email,
      name,
      avatar,
    },
    token,
  });
};

const signOut = async (req, res, next) => {
  const id = req.user._id;
  await Users.updateToken(id, null);
  return res.status(HttpCode.NO_CONTENT).json({ test: "test" });
};

const uploadAvatar = async (req, res) => {
  const id = String(req.user._id);
  const file = req.file;
  const AVATAR_OF_USERS = process.env.AVATAR_OF_USERS;
  const destination = path.join(AVATAR_OF_USERS, id);
  await mkdirp(destination);
  const uploadService = new UploadService(destination);
  const avatarUrl = await uploadService.save(file, id);
  await Users.updateAvatar(id, avatarUrl);
  return res.status(200).json({
    status: "success",
    code: 200,
    data: {
      avatar: avatarUrl,
    },
  });
};

const verifyUser = async (req, res, next) => {
  const user = await Users.findUserByVerifyToken(req.params.token);
  if (user) {
    await Users.updateTokenVerify(user._id, true, null);
    return res.status(HttpCode.OK).json({
      message: "E-mail is verified! Now you can SignIn.",
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

///////Google Auth

const googleAuth = async (req, res) => {
  const stringifiedParams = queryString.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BASE_URL}/api/users/google-redirect`,
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
  });
  return res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
  );
};

const googleRedirect = async (req, res, next) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const urlObj = new URL(fullUrl);
  const urlParams = queryString.parse(urlObj.search);
  const code = urlParams.code;
  const tokenData = await axios({
    url: "https://oauth2.googleapis.com/token",
    method: "post",
    data: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.BASE_URL}/api/users/google-redirect`,
      grant_type: "authorization_code",
      code,
    },
  });
  const userData = await axios({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
    method: "get",
    headers: {
      Authorization: `Bearer ${tokenData.data.access_token}`,
    },
  });
  const { id: verificationToken, name, email, picture } = userData.data;
  const { access_token: token } = tokenData.data;
  const user = await Users.findOne({ email });
  if (!user) {
    const newUser = new Users({
      email,
      name,
      picture,
      token,
      verificationToken,
      isGoogle: true,
      verify: true,
    });
    await newUser.save();
  }
  if (user && !user.verify) {
    throw new BadRequest(
      "Not Verified. Please enter your email and confirm registration"
    );
  }
  if (user && user.token === null) {
    await Users.findByIdAndUpdate(user._id, { token });
  }

  return res.redirect(`${process.env.FRONTEND_URL}/auth?accessToken=${token}`);
};

module.exports = {
  signUp,
  signIn,
  signOut,
  uploadAvatar,
  verifyUser,
  repeatEmailForVerifyUser,
  current,
  googleAuth,
  googleRedirect,
};
