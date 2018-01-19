const hue = require("node-hue-api")
// const hueApi = hue.HueApi

function displayBridges(bridge) {
	console.log("Hue Bridges Found: " + JSON.stringify(bridge));
}

// --------------------------
// Using a promise
hue.nupnpSearch().then(displayBridges).done();

// --------------------------
// Using a callback
// hue.nupnpSearch(function(err, result) {
// 	if (err) throw err;
// 	displayBridges(result);
// });

// Credentials
// {"devicetype":"austwohome"}
//"username": "cq5Yb7Me6tLAS-hxKUDsm9oRtUKpGG24edGUsO01"
// TODO use UPnP
const host = '10.4.0.54'
const username = 'cq5Yb7Me6tLAS-hxKUDsm9oRtUKpGG24edGUsO01'
const api = new hue.HueApi(host, username);

//Verify
function displayResult(result) {
    //TODO parse out each ligh\
    console.log('\nRESULT:', JSON.stringify(result.lights, null, 2))
}

function displayLightState(result) {
    console.log('\nLIGHT STATE:', JSON.stringify(result, null, 2))
}

api.config()
    .then(displayResult)
    .done();

api.lights()
    .then(displayResult)
    .done()

const lightState = hue.lightState


// Create a new lightStat objerct to pass to a Philips Hue Light
let partyState = lightState.create().on().transitionFast().colorLoop()

api.setLightState(1, partyState)
    .then(displayLightState)
    .done()

// modul.exports hu
