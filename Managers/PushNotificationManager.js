var apn = require('apn');
var path = require("path");

let pathToP8File =  path.resolve("public","AuthKey_63GXP94F68.p8")

let production = false
if (process.env.NODE_ENV) {
  production = true
}

var options = {
    
  token: {
      key: pathToP8File,
      keyId: "63GXP94F68",
      teamId: "B9ZZD6JN8K"
    },
    production: production
  }
  
  var apnProvider = new apn.Provider(options)


function sendNotification(deviceToken,message) {

        var notification = new apn.Notification();

        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        notification.badge = 1
        notification.sound = "default"
        notification.alert = message
        notification.payload = {'key': 'value'}
        notification.topic = "ZZ.ZZBitRate.app"
        notification.priority = 10

        apnProvider.send(notification, deviceToken).then( (result) => {
            if (result.failed.length > 0) {
              console.log(result.failed[0].response)

            }
            else {
              console.log(result)
            }
        })
        .catch(err => {

          console.log(`notification result: ${err}`)

        })

      }


module.exports = {
  sendNotification
}