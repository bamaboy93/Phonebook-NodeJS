const express = require("express");
const router = express.Router();

const {
  getContacts,
  getContact,
  removeContact,
  saveContact,
  updateContact,
  updateStatusFavoriteContact,
} = require("../../controllers/contacts");
const {
  validateContact,
  validateContactPatch,
  validateContactStatusPatch,
  validateContactId,
} = require("./validation");

const guard = require("../../helpers/guard");
const wrapError = require("../../helpers/error-handler");

router.get("/", guard, wrapError(getContacts));

router.get("/:contactId", guard, validateContactId, wrapError(getContact));

router.post("/", guard, validateContact, wrapError(saveContact));

router.delete(
  "/:contactId",
  guard,
  validateContactId,
  wrapError(removeContact)
);

router.put(
  "/:contactId",
  guard,
  [validateContactId, validateContactPatch],
  wrapError(updateContact)
);

router.patch(
  "/:contactId/favorite",
  guard,
  [validateContactId, validateContactStatusPatch],
  wrapError(updateStatusFavoriteContact)
);

module.exports = router;
