const { tables } = require("../index.js");

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.doctor, (table) => {
      table.integer("id").unsigned().notNullable().primary();

      table.string("name", 255).notNullable();
      table.string("speciality", 255).notNullable();
      table.integer("numberOfPatients").unsigned().notNullable();
      table.string("photo", 255);

      table.string("hospital", 255);
      table.integer("numberOfRatings").unsigned();
      table.string("rating", 255);
      table.text("about");
      table.json("timeSlots");

      table
        .foreign("id", "fk_doctor_user")
        .references(`${tables.user}.id`)
        .onDelete("CASCADE");
    });
  },
  down: async (knex) => {
    await knex.schema.dropTableIfExists(tables.doctor);
  },
};
