'use strict';
const express = require('express')
const util = require('util')
const bodyParser = require('body-parser')
const app = express()
const partyLights = require('./hue.js')

const jsonParser = bodyParser.json({
    extended: true
})

/**
* Logging
*/
const logStuff = function(req, res, next) {
    // console.log('\n __req__ \n: ', req)
    console.log('\nRequest Header__ \n ', req.headers)
    // console.log('\n __Request \n ', req);
    // console.log('\n __Request originalURL__ \n ', req.originalUrl);
    console.log('\nRequest Body (jsonParser)__ \n ', req.body)
    // console.log('\n __Request Params__ \n ', req.params);
    // console.log('\n __Request Query__ \n ', req.query);
    next()
}

app.use(logStuff)

app.post('/', jsonParser, (req, res) => {
    if (!req.body || !Object.keys(req.body)) return res.sendStatus(400)
    console.log('jsonParser body', req.body);

    let responseToProxy = {
        statusCode: 200,
        body: {
            message:'Got a POST: You\'ve reached the Illumination Station!',
            source: 'IlluminationStation studio app',
            fulfillmentText: 'Horray! changing the lights for you!',
        }
    }

    partyLights()
        .then( (result) => console.log('\nHue Light State:', JSON.stringify(result, null, 2)))
        .done(res.send(responseToProxy))
    // res.send(responseToProxy)
})


app.put('/', (req, res) => res.send({message:'Got a PUT: You\'ve reached the Illumination Station!'}))

// app.get('/healthcheck', (req, res) => res.sendStatus(200))
//
// app.get('/partylights', (req, res) => {
//     res.send({message: 'Party Lights!!'})
// })


app.listen(9800, () => console.log('Example app listening on port 9800!'))


require('./hue')
