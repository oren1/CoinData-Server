// const { createUser,
//         createNotification,
//         updateUserToken,
//         updateNotification,
//         deleteNotification } = require("../Controllers/userController")

const UserController = require("../Controllers/userController")
let userController = null

const routes = (App,redisManager) => {

    userController = UserController(redisManager)

    App.route("/createUser")
    .post(userController.createUser)

    App.route("/createNotification/:notificationType")
    .post(userController.createNotification)

    App.route("/updateUserToken")
    .post(userController.updateUserToken)

    App.route("/updateNotification")
    .post(userController.updateNotification)

    App.route("/deleteNotification/:notificationType")
    .post(userController.deleteNotification)
}

module.exports = routes