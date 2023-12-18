const config = require("config");

const { initializeLogger } = require("../src/core/logging");
const Role = require("../src/core/roles");
const { initializeData, getKnex, tables } = require("../src/data");

module.exports = async () => {
  initializeLogger({
    level: config.get("log.level"),
    disabled: config.get("log.disabled"),
  });
  await initializeData();

  const knex = getKnex();

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
      id: 10,
      email: "olivia.anderson@gmail.com",
      password_hash:
        "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
      roles: JSON.stringify([Role.DOCTOR]),
    },
  ]);
};
