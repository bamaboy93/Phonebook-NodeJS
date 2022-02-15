const Joi = require("joi");

const schemaUser = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(16).required(),
  subscription: Joi.string(),
});

const validate = async (schema, obj, res, next) => {
  try {
    await schema.validateAsync(obj);
    next();
  } catch (error) {
    res.status(400).json({
      status: "Bad Request",
      message: "Ошибка от Joi или другой библиотеки  валидации",
    });
    next();
  }
};

module.exports.validateUser = async (req, res, next) => {
  return await validate(schemaUser, req.body, res, next);
};
