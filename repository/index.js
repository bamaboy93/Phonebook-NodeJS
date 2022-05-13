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
  const { docs: contacts, ...pageInfo } = result;

  return { pageInfo, contacts };
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

const removeContact = async (contactId, userId, query) => {
  const contactToDelete = await Contact.findOne({
    _id: contactId,
    owner: userId,
  });

  const { date, createdAt } = contactToDelete;

  const deletedContact = await Contact.findByIdAndRemove(contactId);
  const { contacts: updatedContacts, pageInfo } = await listContacts(
    userId,
    query
  );

  return {
    contacts: updatedContacts,
    deletedContact,
    pageInfo,
  };
};

const addContact = async (body, date, query) => {
  const { contacts } = await listContacts(userId, {});
  const lastContact = findLastContact(contacts);
  const latestPrevContact = findLatestPrevContact(contacts, date);
  const laterContacts = findLaterContacts(contacts, date);
  await Contact.create(body);
  const { contacts: updatedContacts, pageInfo } = await listTransactions(
    userId,
    query
  );
  return {
    contacts: updatedContacts,
    pageInfo,
  };
};

const updateContact = async (contactId, body, userId, query) => {
  const contactToUpdate = await Contact.findOne({
    _id: contactId,
    owner: userId,
  });
  if (!updatedContact) return null;
  const { date, createdAt } = contactToUpdate;
  const { contacts } = await listContacts(userId, {});

  const laterContacts = findLaterContacts(contacts, date, createdAt);
  laterContacts.push(contactToUpdate);
  const updatedContact = await Contact.findOneAndUpdate(
    { _id: contactId, owner: userId },
    { ...body },
    { new: true }
  );

  const { contacts: updatedContacts, pageInfo } = await listContacts(
    userId,
    query
  );

  return {
    updatedContact,
    contacts: updatedContacts,
    pageInfo,
  };
};
module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};

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
//   const { docs: contacts } = result;
//   delete result.docs;
//   return { ...result, contacts };
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

// const removeContact = async (contactId, userId) => {
//   const contact = await Contact.findOneAndRemove({
//     _id: contactId,
//     owner: userId,
//   });
//   return contact;
// };

// const addContact = async (body) => {
//   const newContact = await Contact.create(body);
//   return newContact;
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
