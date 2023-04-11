const { Client } = require('pg');

const db = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'sdc',
  password: 'password',
  port: '5432',
});

module.exports = db;