const { tables } = require("../index.js");

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.doctor, (table) => {
      table.integer("id").unsigned().notNullable().primary();

      table.string("name", 255).notNullable();
      table
        .string("speciality", 255)
        .notNullable()
        .defaultTo("Default Speciality");
      table.string("photo", 255).defaultTo("https://i.imgur.com/2WZtVXx.png");

      table.string("hospital", 255).defaultTo("Default Hospital");
      table.text("about").defaultTo("Default About");

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
