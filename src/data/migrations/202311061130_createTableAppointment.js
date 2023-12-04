const { tables } = require("../index.js");

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.appointment, (table) => {
      table.increments("id");
      table.string("description", 1024).notNullable();
      table.integer("numberOfBeds").unsigned().notNullable();
      table.string("condition", 1024).notNullable();
      table.dateTime("date").notNullable();

      table.integer("patient_id").unsigned().notNullable();

      table
        .foreign("patient_id", "fk_appointment_patient")
        // .references(`${tables.patient}.id`)
        .references(`${tables.user}.id`)
        .onDelete("CASCADE");

      table.integer("doctor_id").unsigned().notNullable();

      table
        .foreign("doctor_id", "fk_appointment_doctor")
        // .references(`${tables.doctor}.id`)
        .references(`${tables.user}.id`)
        .onDelete("CASCADE");
    });
  },

  down: async (knex) => {
    // Drop the appointments table
    await knex.schema.dropTableIfExists(tables.appointment);
  },
};
