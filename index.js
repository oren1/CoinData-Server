const mongoose = require('mongoose')
const User = require('./Models/User')
const Notification = require("./Models/Notification").Notification
const express = require("express")
const bodyParser = require("body-parser")
const NetworkManager = require("./Managers/NetworkManager")
const userRoutes = require("./Routes/userRoutes")
const PORT = "4018"

var MongoClient = require('mongodb').MongoClient;

let app = express()

const mongodb = "mongodb+srv://dbuser:atlas123456@cluster0-rhuii.mongodb.net/Users?retryWrites=true&w=majority"

mongoose.connect(mongodb, { useNewUrlParser: true, useUnifiedTopology: true ,useFindAndModify: false }, (err) => {

    if (err) throw err

    console.log("successfuly connected to mongodb trough mongoose")
    startNotificationService()
})

// MongoClient.connect(mongodb, function(err, db) {
//     if (err) throw err;
//     console.log("connected trough mongodb");

// })

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

userRoutes(app)

app.get("/", (req,res) => {

    res.send(`First get request on port ${process.env.PORT || PORT}`)

})

if (process.env.PORT) {
    app.listen(process.env.PORT, () => {

        console.log(`Your server is running on port ${process.env.PORT}`)
    })
}
else {
    app.listen(PORT,"127.0.0.1", () => {

        console.log(`Your server is running on port ${PORT}`)
    })
}

function startNotificationService() {

    // 1. Grab the current rates from coin-market-cap
    NetworkManager.getCoinsRates( (coinsData) => {

        let coinsRates = {}
         
        coinsData.forEach( (coin) => {
            coinsRates[coin.id] = coin.quote.USD.price
        })



        User.find( (err,users) => {  // Grab all users from mongoose.

            // Iterate trough all of them and for each user, loop trough he's notifications.
            // If the current rate is bigger or smaller (depending on the 'direction' property) then the endRate
            // then send a notification  

            users.forEach( (user) => {

                user.notifications.forEach( (notification) => {

                    sendNotificationIfNeeded(user,notification,coinsRates)

                } )

            } )

        })


    } )





}

function sendNotificationIfNeeded(user,notification,coinsRates) {
    let coinRate = coinsRates[notification.assetId]

    if (notification.direction == "up") {
        if(coinRate >= notification.endRate) {
            console.log("send notification")
        }
    }
    else {
        if(coinRate <= notification.endRate) {
            console.log("send notification")
        }
    }
}

function renamingWithMongoDB() {

    var dbo = db.db("Users");

    dbo.collection("users").find({}).toArray(function(err, users) {
        if (err) throw err;
  
          users.forEach((user) => {
              
              let notifications = []
              user.notifications.forEach( (notification,index) => {
                 
                  notifications.push(  
                      {"assetId": notification.assetId,
                      "startRate": notification.startAmount,
                      "percentage": notification.percentage,
                      "endRate": notification.endAmount,
                      "direction": notification.direction,
                      "dateCreated": notification.dateCreated })
             
                  })
  
  
              let update = { $set: { notifications: notifications }}   
              
              dbo.collection("users").updateOne({_id: user._id}, update,(err,result) => {
                  if (err) throw err
                  console.log(result)
              })
              
          })
  
          db.close()
  
      });

}

 async function doSomeLogic() {
    console.log('successfuly connected')

    console.log("creating new user")
    const user = new User({token:"atoken"})
    const userDoc = await user.save()
    console.log(`new user created: ${userDoc}`)


    console.log("before calling find")
    User.findById(userDoc._id, (err, user) => {
        
        if (err) throw err

        console.log(`User: ${user}`)

        const notification = new Notification({ assetId:1, 
                                                startAmount:12345,
                                                percentage:10,
                                                endAmount: 22345,
                                                direction:"up",
                                                userId:user._id})

                                                user.notifications.push(notification)
                                                user.save((err,newUser) => {

                console.log(`notification sent ${newUser}`)
        
        })

    })

}