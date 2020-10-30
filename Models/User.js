var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var NotificationSchema = require('./Notification').NotificationSchema


var UserSchema = new Schema({
  token: {type: String, required: false} , 
  dateCreated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);