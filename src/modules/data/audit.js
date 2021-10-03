const { pool } = require('../../../@common/config/database.service');
const moment = require('moment');
const create_date = moment().format();

const saveError = async (name, detail, process) => {
  try {
    await pool.query('INSERT INTO audit (name, detail, process, create_date) VALUES ($1, $2, $3, $4)',
      [name, detail, process, create_date]);

    return { statusCode: 200, success: 'OK' }
  } catch (error) {
    if (error.code === '42601') return { statusCode: 400, error: 'SYNTAX_ERROR', detail: 'La sintaxis SQL esta mal estructurada' }
    if (error.code === '23502') return { statusCode: 400, error: 'NOT_NULL_VIOLATION', detail: `El objeto ${error.column} del body se encuentra vacio` }
    return {
      error
    }
  }
}

module.exports = { saveError }
