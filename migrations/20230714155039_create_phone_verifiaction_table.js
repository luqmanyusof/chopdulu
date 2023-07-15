/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('phone_verification', function (table) {
    table.increments('id').primary();
    table.string('uuid', 100).notNullable();
    table.string('phone_number', 20).notNullable();
    table.string('code', 8).notNullable();
    table.string('status', 20).notNullable();
    table.timestamp('expired_time');
    table.timestamps(true, true);
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('phone_verification');
};
