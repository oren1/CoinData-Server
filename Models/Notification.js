var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const NotificationDirection = {
  BIGGER_THAN: 'biggerThan',
  SMALLER_THAN: 'smallerThan',
}

const NotificationStatus = {
  ENABLED: 'enabeld',
  DISABELD: 'disabeld'
}

const NotificationType = {
  LIMIT_NOTIFICATION: 'limitNotification',
  INTERVAL_NOTIFICATION: 'intervalNotification'
}

var NotificationSchema = new Schema({
  userId: {type: String, required: true},
  exchange: {type: String, required: true},
  name: {type: String, required: true},
  assetId: {type: String, required:true},
  fsym: {type: String, required:true},
  tsym: {type: String, required:true},
  status: {type: String, required: true},
  dateCreated: { type: Date, default: Date.now }
});

var Notification = mongoose.model('Notification', NotificationSchema);




var limitNotificationSchema = new mongoose.Schema({
  limit: {type: Number, required:true},
  direction: {type: String, required:true},
  repeated: {type: Boolean, required:true}
})
limitNotificationSchema.index({exchange: 1, fsym:1, tsym:1, repeated: 1})
var LimitNotification = Notification.discriminator('LimitNotification', limitNotificationSchema)




  var IntervalNotification = Notification.discriminator('IntervalNotification',
  new mongoose.Schema({
    startTime: { type: Date, required: true },
    interval: { type: Number, required: true }
  }) )


module.exports = {

    NotificationSchema,
    LimitNotification,
    IntervalNotification,
    NotificationDirection,
    NotificationStatus,
    NotificationType

}