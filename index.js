const express = require('express')
const app = express()
const port = 3000

// include the Themeparks library
var Themeparks = require("themeparks");

// list all the parks supported by the library
//for (var park in Themeparks.Parks) {
//    console.log("* " + new Themeparks.Parks[park]().Name + " (DisneyAPI." + park + ")");
//}

// access a specific park
var dlpMagicKingdom = new Themeparks.Parks.DisneylandParisMagicKingdom();

// access a specific park
var dlpWaltDisneyStudios = new Themeparks.Parks.DisneylandParisWaltDisneyStudios();

// access wait times by Promise
// dlpMagicKingdom.GetWaitTimes().then(function(rides) {
//     // print each wait time
//     for(var i=0, ride; ride=rides[i++];) {
//         console.log(ride.name + ": " + ride.waitTime + " minutes wait");
//     }
// }, console.error);

app.get('/dlp', (req, res) => {
    dlpMagicKingdom.GetWaitTimes().then(function(rides) {
        res.send(rides)
    }, console.error);
})

app.get('/wds', (req, res) => {
    dlpWaltDisneyStudios.GetWaitTimes().then(function(rides) {
        res.send(rides)
    }, console.error);
})

app.get('/dlp/open', (req, res) => {
    dlpMagicKingdom.GetOpeningTimes().then(function(times) {
        res.send(times)
    }, console.error);
})

app.get('/dlp/park', (req, res) => {
    res.send(JSON.stringify(dlpMagicKingdom));
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))