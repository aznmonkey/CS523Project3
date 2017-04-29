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

app.use('/output', express.static('public/output'));

app.post('/upload', function(req, res){
    var buffer;
    req.on('data', function(data) {
        var dataString = ("" + data).replace(/^data:image\/\w+;base64,/, "");
        buffer = new Buffer(dataString, 'base64');
    });

    req.on('end', function() {
        if (buffer) {
            var pathString = path.join(__dirname, 'views/output.jpg');
            var success = false;

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
                        var process = processFile(pathString);

                        process.stdout.on('data', function(msg) {
                            var string = parseString(msg);
                            if (string.includes('wrote index at')) {
                                success = true;
                            }
                            console.log('+', string);
                        });

                        process.stderr.on('data', function(err) {
                            console.log('-', parseString(err));
                        });

                        process.on('exit', function(data) {
                            console.log('done', data);
                            if (data == 0 && success) {
                                res.sendStatus(200);
                                console.log('success');
                            }
                            else {
                                res.sendStatus(500);
                                console.log('error');
                            }
                        });

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
    var scriptPath = '/data/evl/anishi2/cs523/CS523Project3/pix2pix/';
    var script = 'pix2pix_testPkm';

    var args = [
        "lyra-02",
        "nohup",
        scriptPath + script
    ];
   
    console.log('running'); 
    /* running on lyra */
    return spawn('ssh', args);
}
