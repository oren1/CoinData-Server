const { body, param } = require('express-validator')
const { validateDirectionValue, validateNotificationTypeValue } = require("./Validators")
const { NotificationDirection, NotificationType} = require('../Models/Notification')
const UserController = require("../Controllers/userController")
let userController = null

const routes = (App,redisManager,ccStreamer) => {

    userController = UserController(redisManager,ccStreamer)
    App.route("/createUser")
    .post(userController.createUser)

    App.post('/createNotification/:notificationType',
        [param('notificationType').custom(validateNotificationTypeValue),
         body('direction').custom(validateDirectionValue)],
         userController.createNotification)

    App.route("/updateUserToken")
    .post(userController.updateUserToken)

    // App.route("/updateNotification/:notificationType")
    // .post(userController.updateNotification)

    App.post("/updateNotification/:notificationType",
    [param('notificationType').custom(validateNotificationTypeValue),
     body('direction').custom(validateDirectionValue)],
     userController.updateNotification)

    App.route("/updateNotificationStatus")
    .post(userController.updateNotificationStatus)

    App.route("/getNotifications")
    .post(userController.getNotifications)

    App.route("/deleteNotification")
    .post(userController.deleteNotification)
}

module.exports = routes