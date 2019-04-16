/**
 * Module for cache manager
 */

const redis = require('redis');
const logger = require('heroku-logger');

// Init cache-manager Redis
var cacheManager = redis.createClient();
cacheManager.on('connect', function() {
    logger.info('Redis client connected');
});

cacheManager.on('error', function (error) {
    logger.error('Error during get connection to server Redis ', {error : error});
    // TODO: retry to connect ?
});

module.exports = cacheManager ;