const { tables } = require('../index.js');

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.patient, (table) => {
      table.increments('id');
      
      table.string('name', 255).notNullable();
      table.string('street', 255).notNullable();
      table.string('number', 255).notNullable();
      table.string('postalCode', 255).notNullable();
      table.string('city', 255).notNullable();
      table.timestamp('birthdate').notNullable();
    });
  },
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.patient);
  },
};
