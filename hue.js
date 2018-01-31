const hue = require("node-hue-api")

function displayBridges(bridge) {
	console.log("Hue Bridges Found: " + JSON.stringify(bridge))
}

hue.nupnpSearch().then(displayBridges).done()

// --------------------------
// Using a callback
// hue.nupnpSearch(function(err, result) {
// 	if (err) throw err;
// 	displayBridges(result);
// });

// Credentials
const host = '10.4.0.54'
const username = 'cq5Yb7Me6tLAS-hxKUDsm9oRtUKpGG24edGUsO01'
const api = new hue.HueApi(host, username)

// Verify
function displayResult(result) {
    console.log('\nHue RESULT:', JSON.stringify(result.lights, null, 2))
}

function displayLightState(result) {
    console.log('\nHue LIGHT STATE:', JSON.stringify(result, null, 2))
}

api.config()
    .then(displayResult)
    .done();

api.lights()
    .then(displayResult)
    .done()

const lightState = hue.lightState

function makePartyLights() {
	// Create a new lightStat objerct to pass to a Philips Hue Light
	let partyState = lightState.create().on().transitionFast().colorLoop()
	return api.setLightState(1, partyState)
}

module.exports = makePartyLights
