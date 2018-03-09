 'use strict';
const express = require('express');
const util = require('util');
const bodyParser = require('body-parser');
const app = express();
const lightStates = require('./hue.js');

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://illuminationstation.nmutua.com',
    'http://upwr9p7bk3.execute-api.ap-southeast-2.amazonaws.com'
];

const jsonParser = bodyParser.json({
    extended: true
});

/**
* Logging
*/
const logStuff = function(req, res, next) {
    console.log('\no0o0O0o0o00oo00o0O0o0o0O0o0 App lOgGinG : New Request o0o0o0O0o0o0o00o0O0o0o0O0o0');
    console.log(' * This app allows origins: ', allowedOrigins);
    console.log(' * request headers \n ', req.headers);
    next();
};

const setCORSHeaders = (req, res, next) => {
    const origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
         res.header('Access-Control-Allow-Origin', origin);
    }
    // res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    // res.header('Access-Control-Allow-Origin', 'http://localhost:*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // Set Content-Type HTTP header
    res.type('application/json');
    next();
};

const logDialogFlowPostBody = function(body) {
    console.log('\no0o0oo00o0O0o0o0O0o0  Dialogflow POST req o0o0oo00o0O0o0o0O0o0')
    console.log(' *  req.body.responseId\n', body.responseId);
    // TODO better way to log objects
    // console.log(' *  req.body.queryResult\n', body.queryResult);
    console.log(' *  req.body.queryResult.fulfillmentMessages.payload\n', body.queryResult.fulfillmentMessages[1].payload);
}

const logPostBody = (body) => {
    console.log('\no0o0oo00o0O0o0o0O0o0  Generic POST req o0o0oo00o0O0o0o0O0o0')
    console.log(' *  req.body\n', body);
}

const logLightResponse = (result) => {
    console.log('\nApp Light state changed:', result);
}

/**
 * Parse mood property from the request
 * @param  {Object} resBody [description]
 * @return {string} mood     [description]
 */
const parseMoodFromBody = (body) => {
    let mood;
    // Handle dialogFlow request or web ui request
    if (body.queryResult) {
        logDialogFlowPostBody(body);
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

const sendSuccessRes = (res, resBody) => {
    console.log('\nEND____sendSuccessRes() App Light state changed:', resBody);
    res.json(resBody);
};

const sendErrorResponse = (res, err) => {
    res.status = 500;
    console.log('\nEND____ERROR___sendErrorRes() App Light state changed:', err);
    res.json({error: err});
};

app.use(logStuff);

app.use(setCORSHeaders);

app.get('/', (req, res) => {
    res.send({message:'Hi! You\'ve reached the Illumination Station'})
});

app.get('/lightcheck', jsonParser, (req, res) => {
    lightStates.setState('party');
    setTimeout(() => lightStates.setState('purple'),  5000);
    setTimeout(() => lightStates.setState('soothing'), 8000);
    setTimeout(() => lightStates.setState('oops'), 12000);
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
    if (!req.body || Object.keys(req.body).length === 0) {
        console.log('Request body is empty!!!  Try again!   req.body=', req.body);
        return res.sendStatus(400);
    }
    // console.log('POST recived  req.body:', req.body);
    let mood = parseMoodFromBody(req.body);

    // TODO handle other response erros
    res.status = 200;
    var resBody = {
        source: 'IlluminationStation studio app',
        fulfillmentText: '',
        mood: mood
    };

    switch (mood) {
        case 'party':
            resBody.fulfillmentText = 'Yippee!  I put on the disco lights!  Let\'s boogie!';
            lightStates.setState('party')
                .then(() => sendSuccessRes(res,resBody))
                .catch((err) => sendErrorResponse(res, err));
            break;
        case 'soothing':
            resBody.fulfillmentText = 'Get cosy on the couch and I\'ll set the ambiance for you.  Do you need a massage?'
            lightStates.setState('soothing')
                .then(() => sendSuccessRes(res,resBody))
                .catch((err) => sendErrorResponse(res, err));
            break;
        case 'artic':
            resBody.fulfillmentText = 'Here\'s some cool blue to chill you down.';
            lightStates.setState('artic')
                .then(() => sendSuccessRes(res,resBody))
                .catch((err) => sendErrorResponse(res, err));
            break;
        case 'neutral':
            resBody.fulfillmentText = 'I feel you. It\'s all just goin\' as it goes. Stay illuminated.';
            lightStates.setState('neutral')
                .then(() => sendSuccessRes(res,resBody))
                .catch((err) => sendErrorResponse(res, err));
            break;
        case 'oops':
            resBody.fulfillmentText = 'Ooops!!!  Did you know this is the color of oops?';
            lightStates.setState('oops')
                .then(() => sendSuccessRes(res,resBody))
                .catch((err) => sendErrorResponse(res, err));
            break;
        case 'purple':
            resBody.fulfillmentText = 'Purple people eater!';
            lightStates.setState('purple')
                .then(() => sendSuccessRes(res,resBody))
                .catch((err) => sendErrorResponse(res, err));
            break;
        default:
            console.log('Oops! should not get here.  The mood is:', mood);
            resBody.fulfillmentText = 'Oops. Shit. I\'m in the dark with this one. But maybe this will light you up.';
            resBody.mood = 'oops';
            lightStates.setState('oops')
                .then(() => sendSuccessRes(res,resBody))
                .catch((err) => sendErrorResponse(res, err));
    }
});

app.put('/', (req, res) => res.send({message:'There is nothing to PUT in the Illumination Station'}));

app.listen(9800, () => console.log('Example app listening on port 9800!'));

require('./hue');
