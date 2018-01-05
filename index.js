const userSeed = require('./demo-values').userSeed;
const minutesToWait = 5;
const fs = require('fs');
const demo_values = require('./demo-values.json');

const IotAuth = require('iota-auth').IotAuth;

//initialize with stored seed and expiration time (minutes)
var iotaAuth = new IotAuth(userSeed, minutesToWait);

// function to write access status to database (currently json)
function manageAccess(isValid) {
    demo_values.accessGranted = isValid;

    fs.writeFile('./demo-values.json', JSON.stringify(demo_values, null, 2), function (err) {
        if (err) return console.log(err);
    });
}


// create webserver to emulate portal
var http = require('http');

// http://localhost:9615
http.createServer(function (req, res) {
    if (req.url == '/favicon.ico') {
        res.end("");
        return;
    }

    console.log(req.url);

    if (req.url.length < 2) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync('index.html'));
        return;
    }

    if (req.url.startsWith('/json')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(fs.readFileSync('demo-values.json'));
        return;
    }

    if (req.url.startsWith('/generate')) {
        res.end("");
        // no code -> reloads the seeds data and checks for a new address
        //check validation every X seconds
        var intervalSeconds = 30;
        var timewaited = 0;
        var interval = setInterval(function () {
            timewaited += intervalSeconds;

            if (minutesToWait * 60 <= timewaited) {
                manageAccess('No new adress for ' + minutesToWait + ' minutes. Terminating.');
                console.log('No new adress for ' + minutesToWait + ' minutes. Terminating.');
                clearInterval(interval);
            }

            // Update the elapsed time
            console.log("Time waited: " + timewaited + "/" + minutesToWait * 60);
            
            // check if transaction/new address was recognized
            iotaAuth.isTransactionValid().then(isValid => {
                console.log("2FA is valid: " + isValid);

                // allow access
                if (isValid) {
                    clearInterval(interval);
                    manageAccess('Granted!');
                } else {
                    manageAccess('Not yet confirmed.');
                }
                
            }).catch(error => {
                console.log("Error in isTransactionValid:\n" + error);
            });
        }, 30 * 1000);

        return;
    }

}).listen(9615);
