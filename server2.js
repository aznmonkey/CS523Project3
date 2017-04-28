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
        var pathString = path.join(__dirname, 'views/output.jpg');

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

    var scriptPath = '/data/evl/anishi2/cs523/';
    var script = 'pix2pix_testPkm';

    var args = [
        "lyra-02",
        "nohup",
        scriptPath + script
    ];
   
    console.log('running'); 
    /* running on lyra */
    const spawn = require('child_process').spawn;
    const scriptExecution = spawn("ssh", args);
}