/**
 * See https://github.com/peter-murray/node-hue-api
 */
const hue = require("node-hue-api");

/****** Logging *******/
function displayBridges(bridge) {
	console.log("Hue Bridges Found: " + JSON.stringify(bridge));
}
function displayResult(description, result) {
	console.log('\n',description, '\n', result, '\n');
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

// Reset light state object
const resetState = {
	"on": true,
	"bri": 254,
	"hue": 10,
	"sat": 254,
	"effect": "none",
	"alert": "none"
};

// Reset light state to clear out previous settins.  Note light "0" means all lights
api.setLightState(0, resetState)
	.then( (result) => {
		logSetState('initState.reset', initState._values)
		api.lights().then( (result) => displayResult('INIT AND RESET', result));
	});

// Set initial light state.  Note light "0" means all lights
const initState = hue.lightState.create().on().hue(22600);
api.setLightState(0, initState);


/**********************
* HOW TO SET color
* bri: minimum brightness 0 to its maximum brightness 254
* sat: 25 gives most saturated colors, higher sat means less intensity & more whiteness
* hue: 0 (red) to 65280 (red)
* 	red      0
*	yellow   12750	0*
*    green	 46920	0.1691	0.0441
*	pink     56100	0.4149	0.1776
*	orangy   65280
*
* Other stuff
*	transitionTime 1 = 100ms so 10 = 1second
**************************************/

const lightStates = {

	currentState: initState,

	currentMood: 'none',

	intervalId: null,

	clearInterval: () => {
		console.log('Clearing setTimeout interval.');
		if (this.intervalId) {
			clearInterval(this.intervalId)
			this.intervalId = null;
		}
	},

	lightStateCycle: function({colors, transitionTime}) {
		console.log('{colors, transitionTime}', colors, transitionTime);
		api.setLightState(1, hue.lightState.create().on().transitionFast().effect('none').bri(254).sat(254).hue(colors[0]));

		let i = 0;
		this.intervalId = setInterval( () => {
			i = i === colors.length ? 0 : i+1;
			console.log('i', i, colors.length, colors[i]);
			api.setLightState(1, hue.lightState.create().transitionTime(transitionTime*10).hue(colors[i]));
			// api.setLightState(1, hue.lightState.create().shortAlert().transitionTime(transitionTime*10).hue(colors[i]));
		}, transitionTime*1000);
	},

	party: () => {
		console.log('CRAZXY PARTY');
		const colors = [0, 5000, 12000, 25500, 47000, 54000, 47000 ];
		const transitionTime = .05
		let i = 0;
		api.setLightState(1, hue.lightState.create().on().transitionTime(transitionTime).effect('none').bri(254).sat(254).hue(colors[0]));
		api.setLightState(2, hue.lightState.create().on().transitionTime(transitionTime).effect('none').bri(254).sat(254).hue(colors[1]));
		api.setLightState(3, hue.lightState.create().on().transitionTime(transitionTime).effect('none').bri(254).sat(254).hue(colors[2]));
		this.intervalId = setInterval( () => {
			i = i === colors.length ? 0 : i+1;
			api.setLightState(1, hue.lightState.create().transitionFast().hue(colors[i]));
			api.setLightState(2, hue.lightState.create().transitionFast().hue(colors[i]));
			api.setLightState(3, hue.lightState.create().transitionFast().hue(colors[i+1]));
		}, transitionTime*1000);
		return 'Party lights set.';
	},

	soothing: () => {
		console.log('SOOTHING');
		const colors = [48000, 6120];
		const transitionTime = 3;
		let i = 0;
		api.setLightState(1, hue.lightState.create().on().transitionSlow().effect('none').bri(250).sat(254).hue(colors[0]));
		api.setLightState(2, hue.lightState.create().on().transitionSlow().effect('none').bri(250).sat(254).hue(colors[1]));
		api.setLightState(3, hue.lightState.create().on().transitionSlow().effect('none').bri(254).sat(254).hue(colors[0]));
		this.intervalId = setInterval( () => {
			i = i === 0 ? 1 : 0;
			api.setLightState(1, hue.lightState.create().transitionTime(transitionTime*10).hue(colors[i]));
			api.setLightState(2, hue.lightState.create().transitionTime(transitionTime*10).hue(colors[i+1]));
			api.setLightState(3, hue.lightState.create().transitionTime(transitionTime*10).hue(colors[i]));
		}, transitionTime*1000);
		return 'Soothing lights set.';
	},

	artic: function () {
		const cycleSettings = {
			colors: [43000, 45000],
			transitionTime: 4
		};
		const colors = [43000, 45000];
		let i = 0;
		const transitionTime = 6;
		api.setLightState(1, hue.lightState.create().on().transitionSlow().effect('none').bri(200).sat(254).hue(colors[0]))
		api.setLightState(2, hue.lightState.create().on().transitionSlow().effect('none').bri(200).sat(254).hue(colors[1]))
		api.setLightState(3, hue.lightState.create().on().transitionSlow().effect('none').bri(200).sat(254).hue(colors[1]))
		this.intervalId = setInterval( () => {
			i = i === 0 ? 1 : 0;
			api.setLightState(1, hue.lightState.create().transitionTime(transitionTime*10).hue(colors[i]));
			api.setLightState(2, hue.lightState.create().transitionTime(transitionTime*10).hue(colors[i+1]));
			api.setLightState(3, hue.lightState.create().transitionTime(transitionTime*10).hue(colors[i]));
		}, transitionTime*1000);
		// this.lightStateCycle(cycleSettings);
		// let x = 0;
		// let color;
		// setInterval( () => {
		// 	x++;
		// 	color = 35000 + 7000* Math.sin(x);
		// 	console.log('color', x, color);
		// 	api.setLightState(1, hue.lightState.create().hue(colors));
		// 	api.setLightState(2, hue.lightState.create().hue(color));
		// });
	},

	neutral: () => {
		api.setLightState(1, hue.lightState.create().on().transitionInstant().effect('none').hsl(30,38,60));
		api.setLightState(2, hue.lightState.create().on().transitionInstant().effect('none').hsl(30,38,60));
		api.setLightState(3, hue.lightState.create().on().transitionInstant().effect('none').hsl(30,38,60));
	},

	oops: () => {
		api.setLightState(1, hue.lightState.create().on().shortAlert().transitionFast().bri(200).sat(254).hue(26920));
		api.setLightState(2, hue.lightState.create().on().shortAlert().transitionFast().bri(200).sat(254).hue(5155));
		api.setLightState(3, hue.lightState.create().on().shortAlert().transitionFast().bri(200).sat(254).hue(8906));
	},

	purple: () => {
		api.setLightState(1, hue.lightState.create().on().transitionFast().xy(0.24, 0.08));
		api.setLightState(2, hue.lightState.create().on().transitionFast().bri(200).sat(254).hue(50000));
		api.setLightState(3, hue.lightState.create().on().transitionFast().bri(200).sat(254).hue(50000));
	},

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
					reject(err);
				})
				.done();
		});
	},

	setState: function (mood){
		console.log('lightStates.setState() to mood:', mood);
		// Use promise to match with previous code
		return new Promise((resolve, reject) => {
			if (!mood) {
				return reject('Missing mood, cannot change the lighting.');
			}
			this.currentMood = mood;
			this.resetState()
				.then( (res) => {
					displayResult('RESET STATE DONE', res);
					// Call the mood function and save response to send back to caller
					const moodSet = this[mood]();
					resolve(moodSet);
				})
				.catch( (err) => {
					reject(err);
				})
				.done();
		});
	},

	resetState: function(){
		console.log('resetState()');
		this.clearInterval();
		return api.setLightState(1, resetState);
		return api.setLightState(2, resetState);
		return api.setLightState(3, resetState);
	},

	off: function () {
		return api.setLightState(1, this.currentState.off())
				  .then((res) => console.log('Turning off'));
	}
}
// Set initial state to artic
lightStates.setState('artic');

module.exports = lightStates
