const fs = require('fs');
const demo_values = require('./demo-values.json');

// function to write access status to database (currently json)
function manageAccess(status) {
  demo_values.accessGranted = status;

  fs.writeFile('./demo-values.json', JSON.stringify(demo_values, null, 2), function (err) {
    if (err) return console.log(err);
  });
}

// initialize JSON-file with status
manageAccess('Access not yet requested')

// create webserver to emulate portal
var http = require('http');

// http://localhost:9615
http.createServer(function (req, res) {
  if (req.url == '/favicon.ico') {
    res.end("");
    return;
  }

  console.log(req.url);

  // serve website
  if (req.url.length < 2) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync('index.html'));
    return;
  }

  // database was requested (for proof of work there is no real DB, just a JSON file)
  if (req.url.startsWith('/json')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(fs.readFileSync('demo-values.json'));
    return;
  }

  // button was clicked
  if (req.url.startsWith('/generate')) {
    res.end("");

    // set waiting status in GUI
    manageAccess('Not yet confirmed')

    // initialize IotAuth-module
    const IotAuth = require('iota-auth').IotAuth;
    
    //initialize with stored seed and expiration time (minutes)
    var iotaAuth = new IotAuth(demo_values.userSeed, demo_values.minutesToWait);

    // no code -> reloads the seeds data and checks for a new address
    //check validation every X seconds
    var intervalSeconds = 30;
    var timewaited = 0;
    var interval = setInterval(function () {
      timewaited += intervalSeconds;

      if (minutesToWait * 60 <= timewaited) {
        manageAccess('Access denied<br/>(No confirmation for ' + minutesToWait + ' minutes)');
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
          manageAccess('Access granted');
        }

      }).catch(error => {
        if (error == "TypeError: Cannot read property 'transfers' of undefined") {
          console.log("Error in isTransactionValid:\n" + error + "\nThis is most likely due to a connectivity issue between the server and the node.");
        }
      });
    }, 30 * 1000);

    return;
  }

}).listen(9615);
