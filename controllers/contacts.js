const Contacts = require("../repository/index");
const { CustomError } = require("../helpers/custom-error");
const { HttpCode } = require("../config/constant");

const getContacts = async (req, res) => {
  const userId = req.user._id;
  const data = await Contacts.listContacts(userId, req.query);
  res.json({
    status: "success",
    code: HttpCode.OK,
    data: { ...data },
  });
};

const getContact = async (req, res, next) => {
  const userId = req.user._id;
  const contact = await Contacts.getContactById(req.params.contactId, userId);
  if (contact) {
    return res
      .status(HttpCode.OK)
      .json({ status: "success", code: HttpCode.OK, data: { contact } });
  }

  throw new CustomError(HttpCode.NOT_FOUND, "Not Found");
};

const saveContact = async (req, res, next) => {
  const userId = req.user._id;
  const contact = await Contacts.addContact({
    ...req.body,
    owner: userId,
  });
  if (contact) {
    return res.json({
      status: "success",
      code: HttpCode.CREATED,
      data: { contact, pageInfo },
    });
  }

  throw new CustomError(HttpCode.NOT_FOUND, "Not Found");
};

const removeContact = async (req, res, next) => {
  const userId = req.user._id;

  const contact = await Contacts.removeContact(req.params.contactId, userId);
  if (contact) {
    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      message: "Deleted",
      data: { contact, pageInfo },
    });
  }

  throw new CustomError(HttpCode.NOT_FOUND, "Not Found");
};

const updateContact = async (req, res, next) => {
  const userId = req.user._id;
  const contact = await Contacts.updateContact(
    req.params.contactId,
    req.body,
    userId
  );

  if (contact) {
    return res
      .status(HttpCode.OK)
      .json({ status: "success", code: HttpCode.OK, data: { contact } });
  }

  throw new CustomError(HttpCode.NOT_FOUND, "Not Found");
};

const updateStatusFavoriteContact = async (req, res, next) => {
  const userId = req.user._id;
  const contact = await Contacts.updateContact(
    req.params.contactId,
    req.body,
    userId
  );
  if (contact) {
    return res
      .status(HttpCode.OK)
      .json({ status: "success", code: HttpCode.OK, data: { contact } });
  }

  throw new CustomError(HttpCode.BAD_REQUEST, "missing field favorite");
};

module.exports = {
  getContacts,
  getContact,
  removeContact,
  saveContact,
  updateContact,
  updateStatusFavoriteContact,
};
