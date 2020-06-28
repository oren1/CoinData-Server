var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const NotificationTypes = {
  BIGGER_THEN: 'biggerThen',
  SMALLER_THEN: 'smallerThen',
}

var NotificationSchema = new Schema({
  userId: {type: String, required: true},
  symbol: {type: String, required:true},
  assetId: {type: String, required:true},
  limit: {type: Number, required:true},
  type: {type: String, required:true},
  fsym: {type: String, required:true},
  tsym: {type: String, required:true},
  dateCreated: { type: Date, default: Date.now }
});


var Notification = mongoose.model('Notification', NotificationSchema);


module.exports = {

    NotificationSchema,
    Notification,
    NotificationTypes

}