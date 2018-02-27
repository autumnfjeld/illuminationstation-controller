const hue = require("node-hue-api");

/****** Logging *******/
function displayBridges(bridge) {
	console.log("Hue Bridges Found: " + JSON.stringify(bridge));
}
function displayResult(description, result) {
	console.log('\n',description, '\n', result, '\n');
	// console.log('\n',description, '\n', JSON.stringify(result, null, 2), '\n');
}
function logSetState(stateLabel, stateValues) {
	console.log('\no0o0oo00o00o0o0O0o00oO0o0o0O0o00oo00Oo\n' +
		'Setting ', '*'+stateLabel+'*', 'light state with values:\n' , stateValues ,
	  	'\no0o0oo00o0O0o0o0O0o00oO0o000o00oo0o0Oo');
}
// function displayLightState(result) {
//     console.log('\nHue LIGHT STATE:', JSON.stringify(result, null, 2))
// }
/******* Find and configure hue bridge *****/

// Find hue bridge
hue.nupnpSearch().then(displayBridges).done();

// Credentials
const host = '10.4.0.54'
const username = 'cq5Yb7Me6tLAS-hxKUDsm9oRtUKpGG24edGUsO01'
const api = new hue.HueApi(host, username)

api.config()
    .then( (result) => displayResult('CONFIG', result))
	.catch( (error) => console.log('OOPS! ERROR in hue api.config(). Is the bridge available?\n Error is:', error))
    .done();

api.lights()
    .then( (result) => {
		displayResult('EXISTING STATE', result)
	})
    .done()

const resetState = {
	"on": true,
	"bri": 254,
		"hue": 10,
		"sat": 254,
		"effect": "none",
		"xy": [
			0.35,
			0.3
		],
		"ct": 319,
		"alert": "none"
};

// initState.reset();
// api.setLightState(1, initState.reset())
api.setLightState(1, resetState)
	.then( (result) => {
		console.log("WTHD", result);
		logSetState('initState.reset', initState._values)
		api.lights().then( (result) => displayResult('INIT AND RESET', result));
	});
let initState = hue.lightState.create().on();

// const lightState = hue.lightState
// Clear all light statesf
// api.setLightState(1, hue.lightState.create().off())

const lightStates = {

	currentState: initState,

	currentMood: 'none',

	party: hue.lightState.create().on().transitionFast().xy(.25,.11).colorLoop().alert('lselect').colorLoop(),

	soothing: hue.lightState.create().on().transitionInstant().effect('none').xy(0.57, 0.34),

	artic: hue.lightState.create().on().transitionInstant().effect('none').xy(0.25, 0.15),

	oops: hue.lightState.create().on().transitionFast().alert('select').xy(0.08, 0.61),

	purple: hue.lightState.create().on().transitionFast().xy(0.24, 0.08),

	getState: function(){
		let current = {
			mood: this.currentMood,
			lightState: this.currentState
		};
		return new Promise((resolve, reject) => {
			api.lights()
			.then( (result) => {
				current.lightState = result;
				displayResult('CURRENT STATE', current);
				resolve(current);
			})
			.catch( (err) => {
				reject(err)
			})
			.done()

		})
	},

	setState: function (mood){
		this.resetState()
		this.currentState = this[mood];
		this.currentMood = mood;
		logSetState(mood, this[mood]._values);
		return api.setLightState(1, this[mood]);

		// Clear old state
		// api.setLightState(1, this.currentState.off())
		// 	.then( () => {
		// 		this.currentState = this[state]
		// 		logSetState(state, this[state]._values);
		// 		api.lights()
		// 		    .then( (result) => {
		// 				displayResult('EXISTING STATE', result);
		// 			})
		// 			.then( () => {
		// 				return api.setLightState(1, this[state]);
		// 			})
        //
		// 	});
	},

	resetState: function(){
		api.setLightState(1, resetState)
			.then( (res) => {displayResult('RESET STATE DONE', res)});
	},

	off: function () {
		return api.setLightState(1, this.currentState.off())
				  .then(logSetState('off', this.state));

	},

	// party: function () {
	// 	// Create a new lightStat objerct to pass to a Philips Hue Light
	// 	this.state.reset()
	// 	// this.state = hue.lightState.create().on().transitionFast().colorLoop()
	// 	logSetState('party', this.state)
	// 	return api.setLightState(1, this.state.transitionFast().colorLoop())
	// },
    //
	// soothing: function () {
	// 	console.log('this', this);
	// 	// this.state = null
	// 	// this.state = hue.lightState.create().on().transitionInstant().xy(0.57, 0.34)
	// 	this.state.reset()
	// 	logSetState('soothing', this.state)
	// 	return api.setLightState(1, this.state.reset().transitionInstant().xy(0.57, 0.34))
	// },
    //
	// oops: function () {
	// 	// this.state = null
	// 	// this.state = hue.lightState.create().on().transitionFast().alert('lselect').xy(0.08, 0.61)
	// 	console.log('this.state', this.state);
	// 	this.state.transitionFast().alert('lselect').xy(0.08, 0.61)
	// 	logSetState('oops', this.state)
	// 	return api.setLightState(1, this.state)
	// }
}
// console.log('lightStates', lightStates);


module.exports = lightStates
