A simple webinterface to provide a proof-of-work for https://github.com/thedewpoint/iotauth. Possible future scenarios include an App that solely attaches addresses or sends zero-transactions including auth-codes. To provide tangle-based 2FA.

1. Invoke the webserver with `node index.js`
2. Open the website (http://localhost:9615/)
3. Use the shown Seed to login to the wallet on node `https://nodes.iota.cafe:443`
4. Click the button on the website to start the validation process
5. Generate a new address in the wallet

The website should change the buttons color and text according to the login status.

TODO: Implement transaction code.

![-](https://raw.githubusercontent.com/Blogshot/iotauth-demo/master/images/red.png)
![-](https://raw.githubusercontent.com/Blogshot/iotauth-demo/master/images/yellow.png)
![-](https://raw.githubusercontent.com/Blogshot/iotauth-demo/master/images/green.png)