// Ik gebruikt Knex.js om databasetabellen te creëren en te wijzigen.
// Bijvoorbeeld, in migratiebestand 202311000000_createTableUser.js, gebruikt ik knex.schema.createTable
// om de user tabel te creëren:
const { tables } = require("../index.js");

module.exports = {
  // De 'up' functie wordt uitgevoerd wanneer de migratie wordt uitgevoerd
  up: async (knex) => {
    // We gebruiken knex.schema.createTable om een nieuwe tabel te maken
    await knex.schema.createTable(tables.user, (table) => {
      table.increments("id"); // Een auto-increment ID veld
      table.string("email").notNullable(); // Een verplicht 'email' veld
      table.string("password_hash").notNullable(); // Een verplicht 'password_hash' veld
      table.jsonb("roles").notNullable(); // Een verplicht 'roles' veld dat een JSONB datatype heeft
      table.unique("email", "idx_user_email_unique"); // Een unieke index op het 'email' veld
    });
  },
  // De 'down' functie wordt uitgevoerd wanneer de migratie wordt teruggedraaid
  down: (knex) => {
    // We gebruiken knex.schema.dropTableIfExists om de tabel te verwijderen als deze bestaat
    return knex.schema.dropTableIfExists(tables.user);
  },
};
