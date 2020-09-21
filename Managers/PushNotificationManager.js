var apn = require('apn');
var path = require("path");

function sendNotification(deviceToken,message) {

  let pathToP8File =  path.resolve("public","AuthKey_63GXP94F68.p8")

    var options = {
        token: {
          key: pathToP8File,
          keyId: "63GXP94F68",
          teamId: "B9ZZD6JN8K"
        },
      }
      
      var apnProvider = new apn.Provider(options)


        var notification = new apn.Notification();

        notification.badge = 1
        notification.sound = "default"
        notification.alert = message
        notification.payload = {'key': 'value'}
        notification.topic = "ZZ.ZZBitRate.app"


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