const User = require("../Models/User")
const Notification = require("../Models/Notification").Notification

const createUser = (req,res) => {

    const user = new User(req.body)

    user.save( (err,newUser) => {

        if (err) res.send(err)
        res.json(newUser)

    })
}

const createNotification = (req,res) => {

    const notification = new Notification(req.body)
   
    notification.save( (err,doc) => {
        if (err) res.send(err)
        res.json(doc)
    })
}

const updateUserToken = (req,res) => {

    User.findOneAndUpdate({_id: req.body.userId}, { token: req.body.token }, {new: true}, (err, userDoc) => {

        if (err) res.send(err)
        res.json(userDoc)
    })

    // User.findByIdAndUpdate(req.body.userId, { token: req.body.token }, {new: true}, (err,userDoc) => {

    //     if (err) res.send(err)
    //     res.json(userDoc)

    // })

}

module.exports = {

    createUser,
    createNotification,
    updateUserToken

}