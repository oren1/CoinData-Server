var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const NotificationDirection = {
  BIGGER_THAN: 'biggerThan',
  SMALLER_THAN: 'smallerThan',
}

const NotificationStatus = {
  ENABLED: 1,
  DISABLED: 0
}

const NotificationType = {
  LIMIT_NOTIFICATION: 'limitNotification',
  INTERVAL_NOTIFICATION: 'intervalNotification'
}

const RepeatedState = {
  LIMIT_BASE: 'limitBase',
  WAITING_LIMIT_BASE: 'waitingLimitBase',
}

var NotificationSchema = new Schema({
  userId: {type: String, required: true},
  exchange: {type: String, required: true},
  name: {type: String, required: true},
  fsym: {type: String, required:true},
  tsym: {type: String, required:true},
  status: {type: Number, required: true, default: NotificationStatus.ENABLED},
  dateCreated: { type: Date, default: Date.now },
  dateCreatedInMiliseconds: { type: Number, default: Date.now()}
})

NotificationSchema.methods.getPair = function() {
  return this.fsym +"~"+ this.tsym
}

NotificationSchema.methods.getSubscriptionString = function() {
  return this.exchange +"~"+ this.fsym +"~"+ this.tsym
}
var Notification = mongoose.model('Notification', NotificationSchema);


var limitNotificationSchema = new mongoose.Schema({
  limit: {type: Number, required:true},
  direction: {type: String, required:true},
  repeated: {type: Boolean, required:true},
  repeatedState: {type: String, default:RepeatedState.LIMIT_BASE}
})

limitNotificationSchema.index({exchange: 1, fsym:1, tsym:1, repeated: 1})

var LimitNotification = Notification.discriminator('LimitNotification', limitNotificationSchema)




  var IntervalNotification = Notification.discriminator('IntervalNotification',
  new mongoose.Schema({
    startTime: { type: Number, required: true , default: Date.now() },
    interval: { type: Number, required: true }
  }) )


module.exports = {

    NotificationSchema,
    Notification,
    LimitNotification,
    IntervalNotification,
    NotificationDirection,
    NotificationStatus,
    RepeatedState,
    NotificationType

}