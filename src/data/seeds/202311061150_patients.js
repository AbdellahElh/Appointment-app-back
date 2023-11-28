const { tables } = require("..");

module.exports = {
  seed: async (knex) => {
    await knex(tables.patient).delete();
    await knex(tables.patient).insert([
      {
        id: 1,
        name: "Emily Smith",
        street: "789 Oak Street",
        number: "Apt 3C",
        postalCode: "54321",
        city: "Metropolitan City",
        birthdate: "2001-01-01",
      },
      {
        id: 2,
        name: "David Brown",
        street: "456 Elm Avenue",
        number: "Suite 5D",
        postalCode: "12345",
        city: "Urbanville",
        birthdate: "2002-02-02",
      },
      {
        id: 3,
        name: "Sophia Davis",
        street: "101 Pine Road",
        number: "Unit 7B",
        postalCode: "67890",
        city: "Cityscape",
        birthdate: "2003-03-03",
      },
    ]);
  },
};
