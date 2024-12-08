const { tables } = require("../index.js");

exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("user");
  if (!exists) {
    return knex.schema.createTable(tables.user, (table) => {
      table.increments("id").primary();
      table.string("email", 255).notNullable().unique();
      table.string("password_hash", 255).notNullable();
      table.jsonb("roles").notNullable();
    });
  }
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("user");
};
