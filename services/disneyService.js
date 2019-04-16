const logger = require('heroku-logger');
const Themeparks = require("themeparks"); // include the Themeparks library

var dlpMagicKingdom = new Themeparks.Parks.DisneylandParisMagicKingdom();
var dlpWaltDisneyStudios = new Themeparks.Parks.DisneylandParisWaltDisneyStudios();

var disneyService = {};

disneyService.getWaitingTimes =
    function () {
        logger.info('getWaitingTimes');
        dlpMagicKingdom.GetWaitTimes()
            .then( (dataMK) => {
                dlpWaltDisneyStudios.GetWaitTimes()
                    .then( dataWDS => treatWaitingTimes(dataMK, dataWDS))
                    .catch (error => logger.error('getWaitingTimes >> Error during GetWaitTimes on WDS API Rest', {error: error}))
            })
            .catch(error => logger.error('getWaitingTimes >> Error during GetWaitTimes on MK API Rest', {error: error}));
    }
    
disneyService.fetchOpeningTimes = 
    function () {
        dlpMagicKingdom.FetchOpeningTimes()
            .then( (data) => {
                treatOpeningTimes(data) ;
            })
            .catch( (error) => {
                logger.error('fetchOpeningTimes server', { error: error })
            })
    }

module.exports = disneyService;


