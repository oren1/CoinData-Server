const { createUser,
        createNotification,
        updateUserToken } = require("../Controllers/userController")

const routes = (App) => {

    App.route("/createUser")
    .post(createUser)

    App.route("/createNotification")
    .post(createNotification)

    App.route("/updateUserToken")
    .post(updateUserToken)
}

module.exports = routes