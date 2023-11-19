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

      // Add foreign key constraint for patient_id
      table
        .foreign("patient_id", "fk_appointment_patient")
        .references(`${tables.patient}.id`)
        .onDelete("CASCADE");

      table.integer("doctor_id").unsigned().notNullable();

      // Add foreign key constraint for doctor_id
      table
        .foreign("doctor_id", "fk_appointment_doctor")
        .references(`${tables.doctor}.id`)
        .onDelete("CASCADE");
    });
  },

  down: async (knex) => {
    // Drop the appointments table
    await knex.schema.dropTableIfExists(tables.appointment);
  },
};
