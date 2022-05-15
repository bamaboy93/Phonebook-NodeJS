const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const passport = require("passport");
const helmet = require("helmet");
const boolParser = require("express-query-boolean");

require("dotenv").config();
require("./helpers/google-auth");

const { HttpCode } = require("./config/constant");
const AVATAR_OF_USERS = process.env.AVATAR_OF_USERS;

const contactsRouter = require("./routes/contacts/contacts");
const usersRouter = require("./routes/users/users");
const swaggerRouter = require("./routes/swagger/swagger");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(express.static(AVATAR_OF_USERS));
app.use(helmet());

app.use(logger(formatsLogger));
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  })
);
app.use(express.json({ limit: 10000 }));
app.use(boolParser());
app.use(passport.initialize());

app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);
app.use("/api/docs", swaggerRouter);

app.use((req, res) => {
  console.log("🚀 ~ file: app.js ~ line 44 ~ app.use ~ err", err);
  res
    .status(HttpCode.NOT_FOUND)
    .json({ status: "error", code: HttpCode.NOT_FOUND, message: "Not found" });
});

app.use((err, res) => {
  console.log("🚀 ~ file: app.js ~ line 44 ~ app.use ~ err", err);
  const statusCode = err.status || HttpCode.INTERNAL_SERVER_ERROR;
  res.status(statusCode).json({
    status: statusCode === HttpCode.INTERNAL_SERVER_ERROR ? "fail" : "error",
    code: statusCode,
    message: err.message,
  });
});

module.exports = app;
