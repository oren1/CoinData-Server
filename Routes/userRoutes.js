const { body, param } = require('express-validator')
const { validateDirectionValue, validateNotificationTypeValue, validatePortfolioTypeValue } = require("./Validators")
const { NotificationDirection, NotificationType} = require('../Models/Notification')
const UserController = require("../Controllers/userController")
let userController = null

const routes = (App,redisManager,ccStreamer) => {

    userController = UserController(redisManager,ccStreamer)
    App.route("/createUser")
    .post(userController.createUser)


    // Notification related routes
    App.post('/createNotification/:notificationType',
        [param('notificationType').custom(validateNotificationTypeValue),
         body('direction').custom(validateDirectionValue)],
         userController.createNotification)

    App.route("/updateUserToken")
    .post(userController.updateUserToken)

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

    App.post("/deleteMultipleNotifications",
    body("notificationsIds").exists(),
    userController.deleteMultipleNotifications)

    // Portfolio related routes
    App.post("/addPortfolio",
    [body("type").custom(validatePortfolioTypeValue),
    body("userId").exists(),
    body("name").exists()],
    userController.addPortfolio)

    App.post("/myPortfolios",
    [body("userId").exists()],
     userController.myPortfolios)

     App.get("/supportedExchanges", userController.supportedExchanges)

     App.post("/getBalanceForExchange", 
     [body("exchangeName").exists(),
     body("token").exists()],
     userController.getBalanceForExchange)

     App.post("/addCoinBalance",
     [body("portfolioId").exists(),
    body("symbol").exists(),
    body("amount").exists()],
    userController.addCoinBalance)

    App.post("/deletePortfolio",
    [body("portfolioId").exists()],
    userController.deletePortfolio)

    App.post("/updateCoinBalance",
    [body("portfolioId").exists(),
    body("symbol").exists(),
    body("amount").exists()],
    userController.updateCoinBalance)
    
    App.post("/parseQRCode",
    [body("code").exists(),
    body("exchange").exists()],
    userController.parseQRCode)

    App.post("/deleteMultiplePortfolios",
    body("portfoliosIds").exists(),userController.deleteMultiplePortfolios)

    // Settings route
    App.get("/settings", userController.settings)


}

module.exports = routes