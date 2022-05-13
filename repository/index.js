// const Contact = require("../model/contact");

// const listContacts = async (userId, query) => {
//   const { sortBy = "date", sortByDesc, filter, page = 1, limit = 1e12 } = query;
//   const searchoptions = { owner: userId };

//   const result = await Contact.paginate(searchoptions, {
//     limit,
//     page,
//     sort: {
//       ...(!sortBy && !sortByDesc ? { date: 1 } : {}),

//       ...(sortBy
//         ? sortBy.split`|`.reduce((acc, item) => ({ ...acc, [item]: 1 }), {})
//         : {}),

//       ...(sortByDesc
//         ? sortByDesc.split`|`.reduce(
//             (acc, item) => ({ ...acc, [item]: -1 }),
//             {}
//           )
//         : {}),

//       ...(!sortBy?.includes("createdAt") && !sortByDesc?.includes("createdAt")
//         ? { createdAt: 1 }
//         : {}),
//     },

//     select: filter ? filter.split("|").join(" ") : "",
//     populate: {
//       path: "owner",
//       select: "email subscription",
//     },
//   });
//   const { docs: contacts, ...pageInfo } = result;

//   return { pageInfo, contacts };
// };

// const getContactById = async (contactId, userId) => {
//   const contact = await Contact.findOne({
//     _id: contactId,
//     owner: userId,
//   }).populate({
//     path: "owner",
//     select: "email subscription",
//   });
//   return contact;
// };

// const removeContact = async (contactId, userId, query) => {
//   const contact = await Contact.findOneAndRemove({
//     _id: contactId,
//     owner: userId,
//   });
//   const { contacts, pageInfo } = await listContacts(userId, query);
//   return {
//     contacts,
//     contact,
//     pageInfo,
//   };
// };

// const addContact = async (body, date, query) => {
//   const newContact = await Contact.create(body);
//   const { contacts, pageInfo } = await listTransactions(userId, query);
//   return {
//     contacts,
//     newContact,
//     pageInfo,
//   };
// };

// const updateContact = async (contactId, body, userId) => {
//   const updatedContact = await Contact.findOneAndUpdate(
//     { _id: contactId, owner: userId },
//     { ...body },
//     { new: true }
//   );
//   return updatedContact;
// };
// module.exports = {
//   listContacts,
//   getContactById,
//   removeContact,
//   addContact,
//   updateContact,
// };

const Contact = require("../model/contact");

const listContacts = async (userId, query) => {
  const { sortBy = "date", sortByDesc, filter, page = 1, limit = 1e12 } = query;
  const searchoptions = { owner: userId };

  const result = await Contact.paginate(searchoptions, {
    limit,
    page,
    sort: {
      ...(!sortBy && !sortByDesc ? { date: 1 } : {}),

      ...(sortBy
        ? sortBy.split`|`.reduce((acc, item) => ({ ...acc, [item]: 1 }), {})
        : {}),

      ...(sortByDesc
        ? sortByDesc.split`|`.reduce(
            (acc, item) => ({ ...acc, [item]: -1 }),
            {}
          )
        : {}),

      ...(!sortBy?.includes("createdAt") && !sortByDesc?.includes("createdAt")
        ? { createdAt: 1 }
        : {}),
    },

    select: filter ? filter.split("|").join(" ") : "",
    populate: {
      path: "owner",
      select: "email subscription",
    },
  });
  const { docs: contacts } = result;
  delete result.docs;
  return { ...result, contacts };
};

const getContactById = async (contactId, userId) => {
  const contact = await Contact.findOne({
    _id: contactId,
    owner: userId,
  }).populate({
    path: "owner",
    select: "email subscription",
  });
  return contact;
};

const removeContact = async (contactId, userId) => {
  const contact = await Contact.findOneAndRemove({
    _id: contactId,
    owner: userId,
  });
  return contact;
};

const addContact = async (body) => {
  const newContact = await Contact.create(body);
  return newContact;
};

const updateContact = async (contactId, body, userId) => {
  const updatedContact = await Contact.findOneAndUpdate(
    { _id: contactId, owner: userId },
    { ...body },
    { new: true }
  );
  return updatedContact;
};
module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
