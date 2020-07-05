const User = require("../Models/User")
const config = require("../config")
const {LimitNotification, IntervalNotification, NotificationType} = require("../Models/Notification")
const RedisManager = require("../Managers/RedisManager")

const createUser = (req,res) => {

    const user = new User(req.body)

    user.save( (err,newUser) => {

        if (err) res.send(err)
        res.json(newUser)

    })
}

const createNotification = (req,res) => {
   
    let notificationType = req.params.notificationType


    switch (notificationType) {
        case NotificationType.LIMIT_NOTIFICATION: {
    
            const limitNotification = new LimitNotification(req.body)
       
            limitNotification.save( (err,doc) => {
                if (err) res.send(err)
                res.json(doc)
            })
    
            break;
    
        }
            
        default:
            res.send({error: "notification type param missing"})

            break;
    }
    
     
 }

const updateUserToken = (req,res) => {

    User.findOneAndUpdate({_id: req.body.userId}, { token: req.body.token }, {new: true}, (err, userDoc) => {

        if (err) res.send(err)
        res.json(userDoc)
    })

}

const updateNotification = (req,res) => {

    let notificationType = req.params.notificationType
   
    switch (notificationType) {
        case NotificationType.LIMIT_NOTIFICATION: {
    
            LimitNotification.findOneAndUpdate({_id: req.body.id},req.body, (err,doc) => {

                if (err) res.send(err)
                res.json(doc)
            })
    
            break;
    
        }
            
        default:
            res.send({error: "notification type param missing"})

            break;
    }

}

const deleteNotification = (req,res) => {

    let notificationType = req.params.notificationType
   
    switch (notificationType) {
        case NotificationType.LIMIT_NOTIFICATION: {
    
            LimitNotification.findOneAndDelete({_id: req.body.id}, (err,doc) => {

                if (err) res.send(err)
                res.json(doc)
            })
    
            break;
    
        }
            
        default:
            res.send({error: "notification type param missing"})

            break;
    }


}



module.exports = {

    createUser,
    createNotification,
    updateUserToken,
    updateNotification,
    deleteNotification

}