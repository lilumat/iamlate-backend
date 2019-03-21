const express = require('express')
const cron = require("node-cron");
const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv');
const Themeparks = require("themeparks"); // include the Themeparks library


const app = express()

const DELAY_WAKE_UP_HEROKU_APP = 1000 * 60 * 20 ; // delay in milliseconds - 20 minutes
const DELAY_GET_WAITING_TIMES = 1000 * 10 * 1 // delay in milliseconds to get waiting times
const MK = 'mk';

// Load environment variables
const result = dotenv.config();
if (result.error) {
  throw result.error
}
console.log(result.parsed);

// Conf
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
function insertWaitingTime(waitingTime) {
    client.connect(function(err, client) {
        if (err === null) {
            const db = client.db(dbName);
            // Insert a single document
            db.collection('waitingTimes').insertOne(waitingTime, function(err, r) {
                if (err !== null) {
                    console.error("Error during insert document");
                }
            });
        } else {
            console.error("Error during get connection to server");
        }
    });
}


function wakeUpHerokuApp() {
    console.log('wakeUpHerokuApp');
    // TODO ping localhost
}

function getWaitingTimes() {
    console.log('getWaitingTimes');
    // Promise
    //     .all([dlpMagicKingdom.GetWaitTimes(), dlpWaltDisneyStudios.GetWaitTimes()])
    //     .then(datas => treatWaitingTimes(datas[0], data[1]))
    //     .catch(error => console.error(error));

    // dlpMagicKingdom.GetWaitTimes().then(function(waitingTimesMK) {
    //     dlpWaltDisneyStudios.GetWaitTimes().then(function(waitingTimesWDS) {
    //         treatWaitingTimes(waitingTimesMK, waitingTimesWDS);
    //     }, console.error);
    // }, console.error);


    // treatWaitingTimes({val: 'testMK'}, {val: 'testWDS'});

    dlpMagicKingdom.GetWaitTimes()
        .then(data => mk = treatWaitingTimes(data, {}))
        .catch(error => console.error(error));
}

function treatWaitingTimes(waitingTimesMK, waitingTimesWDS) {
    console.log('treatWaitingTimes');
    const waitingTime = {};
   
    // add extra properties
    waitingTime.top = (new Date()).getTime(); // timestamp
    waitingTime.mk = waitingTimesMK; // response from Disney
    waitingTime.wds = waitingTimesWDS ; // response from Disney
    // persist data
    insertWaitingTime(waitingTime);

}

function treatOpeningTimes(data) {
    console.log('treatOpeningTimes')
}

function fetchOpeningTimes() {
    dlpMagicKingdom.FetchOpeningTimes()
        .then( (data) => {
            treatOpeningTimes(data) ;
        })
        .catch( (error) => {
            console.error(error);
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
scheduleWakeUpHerokuApp();
scheduleGetOpeningTimes();
scheduleGetWaitingTimes();

app.get('/', (req, res) => {
    res.send('ping');
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
// getWaitingTimes();