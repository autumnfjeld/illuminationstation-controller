 'use strict';
const express = require('express');
const util = require('util');
const bodyParser = require('body-parser');
const app = express();
const lightStates = require('./hue.js');


const jsonParser = bodyParser.json({
    extended: true
})

/**
* Logging
*/
const logStuff = function(req, res, next) {
    console.log('\no0o0oo00o0O0o0o0O0o0 app lOgGinG o0o0oo00o0O0o0o0O0o0');
    console.log(' * request headers \n ', req.headers);
    // console.log('\njsonParser req.body\n', req.body);
    // console.log('\njsonParser req.body.responseId\n', req.body.responseId);
    // console.log('\njsonParser req.body.queryResult\n', req.body.queryResult);
    // console.log('\n __Request originalURL__ \n ', req.originalUrl);
    // console.log('\nRequest Body (jsonParser)__ \n ', req.body)
    // console.log('\n __Request Params__ \n ', req.params);
    // console.log('\n __Request Query__ \n ', req.query);
    next();
}

const setCORSHeaders = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // Set Content-Type HTTP header
    res.type('application/json');
    next();
}

const logDialogFlowPostBody = function(body) {
    console.log('\no0o0oo00o0O0o0o0O0o0  Dialogflow lOgGinG o0o0oo00o0O0o0o0O0o0')
    console.log(' *  req.body.responseId\n', body.responseId);
    console.log(' *  req.body.queryResult\n', body.queryResult);
}

const logPostBody = (body) => {
    console.log('\no0o0oo00o0O0o0o0O0o0  Generic POST req o0o0oo00o0O0o0o0O0o0')
    console.log(' *  req.body\n', body);
}

const logLightResponse = (result) => {
    console.log('\nLight state changed:', result);
}

/**
 * Parse mood property from the request
 * @param  {Object} resBody [description]
 * @return {string} mood     [description]
 */
const parseMoodFromBody = (body) => {
    let mood;
    if (body.queryResult) {
        logDialogFlowPostBody(req.body);
        let msgs = body.queryResult.fulfillmentMessages;
        let customPayload = msgs.find( (msg) => msg.hasOwnProperty('payload') );
        mood = customPayload.payload.mood;
        console.log('Found custom payload', customPayload);
    } else {
        // Simple request body
        logPostBody(body);
        mood = body.mood;
    }
    console.log('mood:', mood);
    return mood;
}

app.use(logStuff);

app.use(setCORSHeaders);

app.get('/', (req, res) => {
    res.send({message:'Hi! You\'ve reached the Illumination Station'})
});

app.get('/lightcheck', jsonParser, (req, res) => {
    lightStates.setState('party');
    setTimeout(() => lightStates.setState('oops'),  5000);
    setTimeout(() => lightStates.setState('soothing'), 8000);
    setTimeout(() => lightStates.setState('purple'), 12000);
    setTimeout(() => {
        lightStates.getState();
        res.send({message: 'Healthcheck done! You shoulda seen a hellavalotta lights'});
    }, 13000);
});

app.get('/getstate', jsonParser, (req, res) => {
    lightStates.getState()
        .then((state) => {
            res.send(state);
        });
        // TODO handle err
});

app.post('/', jsonParser, (req, res) => {
    console.log('req.', req.body);
    if (!req.body || !Object.keys(req.body)) {
        return res.sendStatus(400)
    }
    let mood = parseMoodFromBody(req.body);


    // TODO handle other response erros
    res.status = 200
    var resBody = {
        source: 'IlluminationStation studio app',
        fulfillmentText: "sdsd"
    };

    switch (mood) {
        case 'party':
            resBody.fulfillmentText = 'I\'m puttin on the disco lights! Let\'s boogie!'
            lightStates.setState('party')
                .then(logLightResponse)
                .done(res.json(resBody))
            break
        case 'soothing':
            resBody.fulfillmentText = 'I feel you.  Why don\'t you get cosy on the couch and I\'ll set the ambiance for you.  Do you need a massage?'
            lightStates.setState('soothing')
                .then(logLightResponse)
                .done(res.json(resBody))
            break
        default:
            console.log('Oops! should not get here:', mood)
            resBody.fulfillmentText = 'Oops. I\'m in the dark with this one. But maybe this will light you up.'
            lightStates.setState('oops')
                .then(logLightResponse)
                .done(res.json(resBody))
    }
})


app.put('/', (req, res) => res.send({message:'There is nothing to PUT in the Illumination Station'}))

    // app.get('/healthcheck', (req, res) => res.sendStatus(200))
    //
    // app.get('/partylights', (req, res) => {
    //     res.send({message: 'Party Lights!!'})
    // })


app.listen(9800, () => console.log('Example app listening on port 9800!'))


require('./hue')
