const { createUser,
        createNotification,
        updateUserToken,
        updateNotification,
        deleteNotification } = require("../Controllers/userController")

const routes = (App) => {

    App.route("/createUser")
    .post(createUser)

    App.route("/createNotification/:notificationType")
    .post(createNotification)

    App.route("/updateUserToken")
    .post(updateUserToken)

    App.route("/updateNotification")
    .post(updateNotification)

    App.route("/deleteNotification")
    .post(deleteNotification)
}

module.exports = routes