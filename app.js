const express = require('express')
const cron = require("node-cron");
const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv');
const Themeparks = require("themeparks"); // include the Themeparks library
var redis = require('redis');
const logger = require('heroku-logger')
 
const app = express()

const DELAY_WAKE_UP_HEROKU_APP = 1000 * 60 * 20 ; // delay in milliseconds - 20 minutes
const DELAY_GET_WAITING_TIMES = 1000 * 10 * 1 // delay in milliseconds to get waiting times
const OPENING_TIMES = 'OPENING_TIMES';
const LAST_WAITING_TIMES = 'LAST_WAITING_TIMES';

// Load environment variables
const result = dotenv.config();
if (result.error) {
  throw result.error
}
console.log(result.parsed);

// Init cache-manager Redis
var cacheManager = redis.createClient();
cacheManager.on('connect', function() {
    console.log('Redis client connected');
});
cacheManager.on('error', function (err) {
    console.log('Something went wrong ' + err);
});



// Conf environment
const port = process.env.PORT;

// Globals
var wakeUpHerokuAppIntervalID ;
var getWaitingTimesIntervalID ;
var dlpMagicKingdom = new Themeparks.Parks.DisneylandParisMagicKingdom();
var dlpWaltDisneyStudios = new Themeparks.Parks.DisneylandParisWaltDisneyStudios

// Connection URL
const url = process.env.DATABASE_URL;

// Database Name
const dbName = 'iamlate';

// Create a new MongoClient
const client = new MongoClient(url, { useNewUrlParser: true });

// Insert snapshots waiting times of rides
function insertWaitingTimes(waitingTime) {
    client.connect()
        .then( res => {
            const db = client.db(dbName);
            db.collection('waitingTimes').insertOne(waitingTime)
                .catch(error => logger.error('insertWaitingTimes >> Error during insert document', {error: error}))
        })
        .catch(error => logger.error('insertWaitingTimes >> Error during get connection to server', {error: error}));
}


function wakeUpHerokuApp() {
    logger.info('wakeUpHerokuApp');
    // TODO ping localhost
}

function getWaitingTimes() {
    logger.info('getWaitingTimes');

    dlpMagicKingdom.GetWaitTimes()
        .then( (dataMK) => {
            dlpWaltDisneyStudios.GetWaitTimes()
                .then( dataWDS => treatWaitingTimes(dataMK, dataWDS))
                .catch (error => console.error(error))
        })
        .catch(error => console.error(error));
}

function treatWaitingTimes(waitingTimesMK, waitingTimesWDS) {
    logger.info('treatWaitingTimes');

    // build waitingTime
    const waitingTimes = {};
    waitingTimes.top = (new Date()).getTime(); // timestamp
    waitingTimes.mk = waitingTimesMK; // response from Disney
    waitingTimes.wds = waitingTimesWDS ; // response from Disney

    // put in cache
    cacheManager.set(LAST_WAITING_TIMES, waitingTimes);

    // persist data
    insertWaitingTimes(waitingTimes);

}

function treatOpeningTimes(openingTimes) {
   logger.info('treatOpeningTimes')
   // put in cache
   cacheManager.set(OPENING_TIMES, openingTimes);
   // persist data
   insertOpeningTimes(openingTimes);
}

function fetchOpeningTimes() {
    dlpMagicKingdom.FetchOpeningTimes()
        .then( (data) => {
            treatOpeningTimes(data) ;
        })
        .catch( (error) => {
            logger.error('fetchOpeningTimes server', { error: error })
        })
}

function scheduleGetOpeningTimes() {
    // schedule tasks to be run on the server   
    cron.schedule("* * * * *", function() {
        console.log("running a task every minute");
    });
    // cron.schedule("00 02 * * *", fetchOpeningTimes);
}

function scheduleWakeUpHerokuApp() {
    wakeUpHerokuAppIntervalID = setInterval(wakeUpHerokuApp, DELAY_WAKE_UP_HEROKU_APP);
}

function scheduleGetWaitingTimes() {
    getWaitingTimesIntervalID = setInterval(getWaitingTimes, DELAY_GET_WAITING_TIMES);
}

function stopWakeUpHerokuApp() {
    clearInterval(wakeUpHerokuAppIntervalID);
}

// Boot app
//scheduleWakeUpHerokuApp();
//scheduleGetOpeningTimes();
//scheduleGetWaitingTimes();

app.get('/', (req, res) => {
    cacheManager.get('TestKey', function (error, reply) {
        res.send(reply);
    })
})

app.listen(port, () => {
    logger.info('Starting server', { port: port })
});
// getWaitingTimes();