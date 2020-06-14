var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationSchema = new Schema({
  assetId: {type: String, required:true},
  startRate: {type: Number, required:true},
  percentage: {type: Number, required:true},
  endRate: {type: Number, required:true},
  direction: {type: String, required:true},
  dateCreated: { type: Date, default: Date.now }
});

var Notification = mongoose.model('Notification', NotificationSchema);



module.exports = {

    NotificationSchema,
    Notification

}