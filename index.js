const express = require('express')
const app = express()
const path = require('path')

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
})
app.use(express.static('public'));

app.listen(3000)
console.log("Can view the project at http://localhost:3000")