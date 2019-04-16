/**
 * Module variables depends of environment
 */

const dotenv = require('dotenv');
const logger = require('heroku-logger');

// Load environment variables
const result = dotenv.config();
if (result.error) {
  logger.error('Error during load .env', {error: result.error});
  throw result.error
}
logger.info('init env variables', {result: result.parsed});

var env = {
  DATABASE_NAME = 'iamlate',
  DATABASE_URL = process.env.DATABASE_URL,
  HTTP_PORT = process.env.PORT
};

module.exports = env ;