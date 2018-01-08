const fs = require('fs');
const demo_values = require('./demo-values.json');

/*
  FUNCTION BLOCK

  THIS BLOCK IS USED TO DEFINE FUNKTIONS FOR THE MAIN WORKFLOW
*/

// function to write access status to database (currently json)
function manageAccess(status) {
  demo_values.accessGranted = status;

  fs.writeFile('./demo-values.json', JSON.stringify(demo_values, null, 2), function (err) {
    if (err) return console.log(err);
  });
}

// function handle button press on the website
function handleButtonPress() {
  var minutesToWait = demo_values.minutesToWait

  // set waiting status in GUI
  manageAccess('Not yet confirmed')

  // initialize IotAuth-module
  const IotAuth = require('iota-auth').IotAuth;

  //initialize with stored seed and expiration time (minutes)
  console.log('Got authentication request! Checking for new adresses for up to ' + minutesToWait + ' minute(s) repeatedly');
  var iotaAuth = new IotAuth(demo_values.userSeed, minutesToWait);

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

    // TODO: implementation with transaction code

    // check if transaction/new address was recognized
    iotaAuth.isTransactionValid().then(isValid => {
      console.log("2FA is valid: " + isValid);

      // allow access (AKA coloring the button)
      if (isValid) {
        clearInterval(interval);
        manageAccess('Access granted');
      }

    }).catch(error => {
      if (error == "TypeError: Cannot read property 'transfers' of undefined") {
        console.log("Error in isTransactionValid:\n" + error + "\n(This is most likely due to a connectivity issue between the server and the node)");
      }
    });
  }, 30 * 1000);
}

/*
  MAIN WORKFLOW BLOCK

  THIS BLOCK IS USED TO WRITE THE BASIC WORK FLOW
*/

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

  // serve website
  if (req.url.length < 2) {
    // set content type to html
    res.writeHead(200, { 'Content-Type': 'text/html' });
    // server index.html
    res.end(fs.readFileSync('index.html'));
    return;
  }

  // database was requested (for proof of work there is no real DB, just a JSON file)
  if (req.url.startsWith('/json')) {
    // set content type (json)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    // send file as response
    res.end(fs.readFileSync('demo-values.json'));
    return;
  }

  // button was clicked
  if (req.url.startsWith('/generate')) {

    // send empty response
    res.end("");
    
    handleButtonPress();
    return;
  }

}).listen(9615);
