const { body, param } = require('express-validator')
const { validateDirectionValue, validateNotificationTypeValue, validatePortfolioTypeValue } = require("./Validators")
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
     body("token").exists(),
    body|("portfolioId").exists()],
     userController.getBalanceForExchange)

     App.post("/addCoinBalance",
     [body("portfolioId").exists(),
    body("symbol").exists(),
    body("amount").exists()],
    userController.addCoinBalance)

    App.post("/deletePortfolio",
    [body("portfolioId").exists()],
    userController.deletePortfolio)
}

module.exports = routes