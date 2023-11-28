const { tables } = require("..");
const Role = require("../../core/roles");

module.exports = {
  seed: async (knex) => {
    await knex(tables.user).delete();
    await knex(tables.user).insert([
      {
        id: 1,
        // name: "Abdellah El Halimi Merroun",
        email: "abdellah.elhalimimerroun@student.hogent.be",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.ADMIN, Role.PATIENT, Role.DOCTOR]),
      },
      {
        id: 2,
        // name: "Emily Smith",
        email: "emily.smith@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.ADMIN, Role.PATIENT]),
      },
      {
        id: 3,
        // name: "David Brown",
        email: "david.brown@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.PATIENT]),
      },
      {
        id: 4,
        // name: "Sophia Davis",
        email: "sophia.davis@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.PATIENT]),
      },

      //DOCTORS
      {
        id: 5,
        // name: "Olivia Anderson",
        email: "olivia.anderson@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.DOCTOR]),
      },
      {
        id: 6,
        // name: "Michael Brown",
        email: "michael.brown@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.DOCTOR]),
      },
      {
        id: 7,
        // name: "John Wilson",
        email: "john.wilson@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.DOCTOR]),
      },
    ]);
  },
};
