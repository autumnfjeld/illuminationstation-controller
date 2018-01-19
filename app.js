const express = require('express')
const app = express()


app.get('/', (req, res) => res.send('Hello World!'))

app.listen(9800, () => console.log('Example app listening on port 9800!'))


require('./hue')



// app.get('/partylights', function(req, res) {
//
// })

app.get('/partylights', (req, res) => res.send('Party Lights!!'))
