const { tables } = require("../index.js");

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.patient, (table) => {
      table.integer("id").unsigned().notNullable().primary();

      table.string("name", 255).notNullable();
      table.string("street", 255).notNullable().defaultTo("Default Street");
      table.string("number", 255).notNullable().defaultTo("Default Number");
      table.string("postalCode", 255).notNullable().defaultTo("Default postalcode");
      table.string("city", 255).notNullable().defaultTo("Default City");
      table.timestamp("birthdate").notNullable().defaultTo("1990-01-01 00:00:00");

      table
        .foreign("id", "fk_patient_user")
        .references(`${tables.user}.id`)
        .onDelete("CASCADE");
    });
  },
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.patient);
  },
};
