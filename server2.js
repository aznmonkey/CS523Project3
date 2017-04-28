var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');

var server = app.listen(10523, function(){
  console.log('Server listening on port 10523');
});

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', function(req, res){
    req.on('data', function(data) {
        var dataString = ("" + data).replace(/^data:image\/\w+;base64,/, "");
        var buffer = new Buffer(dataString, 'base64');
        var pathString = path.join(__dirname, 'out.jpg');

        fs.writeFile(
            pathString,
            buffer,
            function(err) {
                if (err) {
                    console.log("Error writing image", err);
                }
                else {
                    processFile(pathString);
                }
            }
        );
    });
});

function processFile(pathString) {
    console.log("send this to the shell:", pathString);
}