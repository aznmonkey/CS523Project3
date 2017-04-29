var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

var server = app.listen(10523, function(){
  console.log('Server listening on port 10523');
});

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', function(req, res){
    var buffer;
    req.on('data', function(data) {
        var dataString = ("" + data).replace(/^data:image\/\w+;base64,/, "");
        console.log(data);
        console.log(dataString.slice(0,20));
        buffer = new Buffer(dataString, 'base64');
    });

    req.on('end', function() {
        if (buffer) {
            var pathString = path.join(__dirname, 'views/output.jpg');

            fs.writeFile(
                pathString,
                buffer,
                'base64',
                function(err) {
                    if (err) {
                        console.log("Error writing image", err);
                    }
                    else {
                        console.log("Sending to the shell...")
                        processFile(pathString);
                    }
                }
            );            
        }
    });
});

function parseString(data) {
    return String.fromCharCode.apply(null, data);
}

function processFile(pathString) {
    var scriptPath = '/data/evl/anishi2/cs523/';
    var script = 'pix2pix_testPkm';

    var args = [
        "lyra-02",
        "nohup",
        scriptPath + script
    ];
   
    console.log('running'); 
    /* running on lyra */
    const scriptExecution = spawn("ssh", args);

    scriptExecution.stdout.on('data', function(msg) {
        console.log('stdout', parseString(msg));
    });

    scriptExecution.stderr.on('data', function(err) {
        console.log('error', parseString(err));
    });

    scriptExecution.stdout.on('exit', function(data) {
        console.log('done', data);
    });

}
