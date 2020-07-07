const User = require("../Models/User")
const {LimitNotification, IntervalNotification, NotificationType} = require("../Models/Notification")
let redisManager = null

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

                let pair = doc.fsym + "~"+ doc.tsym
                redisManager.addPairToPairsMap(pair,doc.exchange)
                .then( (value) =>{
                    res.json(doc)
                })
                .catch( (err) => {
                    res.send(err)
                })
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
    
            LimitNotification.findOneAndDelete({_id: req.body.id}, (err,notification) => {

                if (err) res.send(err)

                if(!notification) res.send({error: "notification not exists"})
                var pair = notification.fsym +"~"+notification.tsym

                redisManager.removePairFromExchange(pair,notification.exchange)
                .then( fieldCount => {
                    if(fieldCount == 0) {
                        
                    }
                })
                .catch( err => {
                    console.log(fieldCount)
                })
                res.json(notification)
            })
    
            break;
    
        }
            
        default:
            res.send({error: "notification type param missing"})

            break;
    }


}



module.exports = (_redisManager) => {

    if(!_redisManager) throw new Error("Missing redis manager")

    redisManager = _redisManager

    return {

        createUser,
        createNotification,
        updateUserToken,
        updateNotification,
        deleteNotification
        
    }

}