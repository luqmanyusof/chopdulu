/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('premises', function (table) {
    table.increments('id').primary();
    table.string('uuid', 100).notNullable();
    table.string('business_name', 150).notNullable();
    table.string('password', 200).notNullable();
    table.string('phone_number', 20).notNullable();
    table.boolean('is_active').notNullable().defaultTo(1);
    table.timestamps(true, true);
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('premises');
};
