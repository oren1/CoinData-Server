const User = require("../Models/User")
const Notification = require("../Models/Notification").Notification

const createUser = (req,res) => {

    const user = new User(req.body)

    user.save((err,newUser) => {

        if (err) res.send(err)
        res.json(newUser)

    })
}

const createNotification = (req,res) => {

    User.findById(req.body.userId, (err,userDoc) => {
    

        if (err) res.send(err)

        if (userDoc == null) res.send({message: "user not exists or userId not sent"})
        
        else {
            const notification = new Notification(req.body)

            userDoc.notifications.push(notification)
    
            userDoc.save((err,updatedUser) => {
    
                if (err) res.send(err)
                res.json(updatedUser)
        
            })
        }

        

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