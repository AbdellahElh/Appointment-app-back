const { tables } = require("..");
const Role = require("../../core/roles");

module.exports = {
  // De 'seed' functie wordt uitgevoerd om de initiële data in de tabel te plaatsen
  seed: async (knex) => {
    // We gebruiken knex(tables.user).delete() om alle bestaande data uit de tabel te verwijderen
    await knex(tables.user).delete();
    // We gebruiken knex(tables.user).insert() om nieuwe data in de tabel te plaatsen
    await knex(tables.user).insert([
      // Elke object in deze array vertegenwoordigt een rij in de tabel
      {
        id: 5,
        // name: "Abdellah El Halimi Merroun",
        email: "abdellah.elhalimimerroun@student.hogent.be",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.ADMIN, Role.PATIENT, Role.DOCTOR]),
      },
      {
        id: 1,
        // name: "Emily Smith",
        email: "emily.smith@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.PATIENT]),
      },
      {
        id: 2,
        // name: "David Brown",
        email: "david.brown@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.PATIENT]),
      },
      {
        id: 3,
        // name: "Sophia Davis",
        email: "sophia.davis@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.PATIENT]),
      },

      //DOCTORS
      {
        id: 10,
        // name: "Olivia Anderson",
        email: "olivia.anderson@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.DOCTOR]),
      },
      {
        id: 11,
        // name: "Michael Brown",
        email: "michael.brown@gmail.com",
        password_hash:
          "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
        roles: JSON.stringify([Role.DOCTOR]),
      },
      {
        id: 12,
        // name: "John Wilson",
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
