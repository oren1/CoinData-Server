var mongoose = require('mongoose')
var Schema = mongoose.Schema

var SettingsSchema = new Schema({
    maxAmountOfIntervalNotifications: { type: Number, required: true },
    maxAmountOfLimitNotifications: { type: Number, required: true },
    maxAmountOfPortfolios: { type: Number, required: true },
    fetchDataTimeInterval: { type: Number, required: true }
})

var Settings = mongoose.model("Settings",SettingsSchema)

module.exports = {
    Settings
}