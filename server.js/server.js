var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

var server = app.listen(10523, function(){
  console.log('Server listening on port 10523');
});

app.get('/', function(req, res){
    //res.setHeader('Cache-Control','no-cache, no store');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', function(req, res){
    var dataString;
	
    req.on('data', function(data) {
		var regex = /^data:.+\/(.+);base64,(.*)$/;
		var matches = String(data).match(regex);
		if (matches !== null) {
			var ext = matches[1];
			dataString = matches[2];
			//fs.writeFileSync('data.' + ext, buffer);
			console.log("Starting packet received");
		} else {
			console.log("partial image packet received");
			dataString += data;
		}
    });

    req.on('end', function() {
		console.log("Full packet received?");
		var buffer = new Buffer(dataString, 'base64');
        if (buffer) {
            var pathString = path.join(__dirname, 'public/images/output.jpg');
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
                            var string = parseString(err);
                            console.log('-', string);
                        });

                        process.on('exit', function(data) {
                            console.log('done', data);
                            if (data == 0 && success) {
				res.setHeader('Cache-Control','no-cache, no store');
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
        scriptPath + script + " ModelB2"
		// Note in B2's test script, there's a delay to make sure the others finish first
    ];
   
    console.log('running');
	
	spawn('ssh', ["lyra-04", "nohup", scriptPath + script + " ModelA"]);
	spawn('ssh', ["lyra-06", "nohup", scriptPath + script + " ModelB"]);
	spawn('ssh', ["lyra-08", "nohup", scriptPath + script + " ModelA1"]);
	spawn('ssh', ["lyra-10", "nohup", scriptPath + script + " ModelA2"]);
	spawn('ssh', ["lyra-12", "nohup", scriptPath + script + " ModelB1"]);
    /* running on lyra */
    return spawn('ssh', args);
}
