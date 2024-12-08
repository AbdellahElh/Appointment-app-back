const { tables } = require("..");
const Role = require("../../core/roles");

module.exports = {
  seed: async (knex) => {
    await knex(tables.user).delete();
    await knex(tables.user).insert([
      {
        id: 5,
        email: "abdellah.elhalimimerroun@student.hogent.be",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.ADMIN, Role.PATIENT, Role.DOCTOR]),
      },
      {
        id: 1,
        email: "emily.smith@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.PATIENT]),
      },
      {
        id: 2,
        email: "david.brown@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.PATIENT]),
      },
      {
        id: 3,
        email: "sophia.davis@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.PATIENT]),
      },

      //DOCTORS
      {
        id: 10,
        email: "olivia.anderson@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.DOCTOR]),
      },
      {
        id: 11,
        email: "michael.brown@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.DOCTOR]),
      },
      {
        id: 12,
        email: "john.wilson@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.DOCTOR]),
      },
    ]);
  },
};

// 4otY7oR55hm2Co5AWSRl
// 291491ae
