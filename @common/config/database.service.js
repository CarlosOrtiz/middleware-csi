const { Pool } = require('pg');
require('dotenv').config({ path: '.env' })

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_DATABASE || 'markkenok',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  ssl: { rejectUnauthorized: false }
};

const pool = new Pool({ ...config });

module.exports = {
  pool
}  