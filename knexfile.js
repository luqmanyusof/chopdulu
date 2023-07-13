// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'mysql',
    connection: {
        host: 'database',
        port: 3306,
        user: 'chopdulu_app',
        password: '2023_ch0pDulu',
        database: 'chopdulu'
    }
  },

  production: {
    client: 'mysql',
    connection: {
        host: 'locxtronic.com',
        port: 3306,
        user: 'locxtron_wasapje_app',
        password: '2022_w4s4pj3',
        database: 'locxtron_wasapje'
    }
  }

};
