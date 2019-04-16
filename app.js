const env = require('./config/env.js');
const constantes = require('./config/constantes.js');

const cacheManager = require('./utils/cacheManager.js');

const express = require('express')
const cron = require("node-cron");
const MongoClient = require('mongodb').MongoClient;
const Themeparks = require("themeparks"); // include the Themeparks library

const logger = require('heroku-logger')
 
const app = express()



// Globals
var wakeUpHerokuAppIntervalID ;
var getWaitingTimesIntervalID ;
var dlpMagicKingdom = new Themeparks.Parks.DisneylandParisMagicKingdom();
var dlpWaltDisneyStudios = new Themeparks.Parks.DisneylandParisWaltDisneyStudios

// Create a new MongoClient
const client = new MongoClient(env.DATABASE_URL, { useNewUrlParser: true });

// Insert snapshots waiting times of rides
function insertWaitingTimes(waitingTime) {
    client.connect()
        .then( res => {
            const db = client.db(env.DATABASE_NAME);
            db.collection('waitingTimes').insertOne(waitingTime)
                .catch(error => logger.error('insertWaitingTimes >> Error during insert document', {error: error}))
        })
        .catch(error => logger.error('insertWaitingTimes >> Error during get connection to server MongoDB', {error: error}));
}


function wakeUpHerokuApp() {
    logger.info('wakeUpHerokuApp');
    // TODO ping localhost
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
   cacheManager.set(constantes.OPENING_TIMES, openingTimes);
   // persist data
   insertOpeningTimes(openingTimes);
}


function scheduleGetOpeningTimes() {
    // schedule tasks to be run on the server   
    cron.schedule("* * * * *", function() {
        console.log("running a task every minute");
    });
    // cron.schedule("00 02 * * *", fetchOpeningTimes);
}

function scheduleWakeUpHerokuApp() {
    wakeUpHerokuAppIntervalID = setInterval(wakeUpHerokuApp, constantes.DELAY_WAKE_UP_HEROKU_APP);
}

function scheduleGetWaitingTimes() {
    getWaitingTimesIntervalID = setInterval(getWaitingTimes, constantes.DELAY_GET_WAITING_TIMES);
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

var indexRouter = require('./routes/disneyRoute');
app.use('/iamlate', indexRouter);


app.listen(env.HTTP_PORT, () => {
    logger.info('Starting server', { port: env.HTTP_PORT })
});
// getWaitingTimes();