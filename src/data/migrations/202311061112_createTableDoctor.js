const { tables } = require("../index.js");

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.doctor, (table) => {
      table.increments("id");

      table.string("name", 255).notNullable();
      table.string("speciality", 255).notNullable();
      table.integer("numberOfPatients").unsigned().notNullable();
      table.string("photo", 255);

      table.string("hospital", 255);
      table.integer("numberOfRatings").unsigned();
      table.string("rating", 255);
      table.text("about");
      table.json("timeSlots"); // Change to JSON for MySQL
    });
  },
  down: async (knex) => {
    await knex.schema.dropTableIfExists(tables.doctor);
  },
};

// const { tables } = require("../index.js");

// module.exports = {
//   up: async (knex) => {
//     await knex.schema.createTable(tables.doctor, (table) => {
//       table.increments("id");

//       table.string("name", 255).notNullable();
//       table.string("speciality", 255).notNullable();
//       table.integer("numberOfPatients").unsigned().notNullable();
//       table.string("photo", 255);
//     });
//   },
//   down: (knex) => {
//     return knex.schema.dropTableIfExists(tables.doctor);
//   },
// };
