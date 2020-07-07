const mongoose = require('mongoose')
var redis = require('redis');
const User = require('./Models/User')
const { LimitNotification, NotificationDirection, NotificationStatus } = require("./Models/Notification")
const express = require("express")
const bodyParser = require("body-parser")
const NetworkManager = require("./Managers/NetworkManager")
const userRoutes = require("./Routes/userRoutes")
const PushNotificationManager = require("./Managers/PushNotificationManager")
const PORT = "4018"
const config = require("./config/configuration")
const RedisManager = require("./Managers/RedisManager")
var MongoClient = require('mongodb').MongoClient;

const mongodb = "mongodb+srv://dbuser:atlas123456@cluster0-rhuii.mongodb.net/Users?retryWrites=true&w=majority"

let app = express()


// startServer()

mongoose.connect(mongodb, { useNewUrlParser: true, useUnifiedTopology: true ,useFindAndModify: false, useCreateIndex: true })
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  
    console.log("mongoose connected")

});

const redisClient = redis.createClient({port: 16468, host:"redis-16468.c44.us-east-1-2.ec2.cloud.redislabs.com",
auth_pass: "1xlJwJ1y9W359HyheAWWuXqNiKouQyzv",                                                                                                                                                           
})

redisClient.on("ready", () => { 
    console.log(`redis connected`)

    // var somePairs = ["BTC~USD","ETH~USD","XRP~USD"]   
    // for(let pair of somePairs) {
    //     addPairToPairsMap(pair, "CCCAGG",redisClient)
    // }

    })

redisClient.on('error', function (err) {
    console.log('redis error:' + err)
});

config.db.redisClient = redisClient

const redisManager = RedisManager(config.db.redisClient)


// this is where you paste your api key
var apiKey = "dd470f89924f82d5f63d337a001d096c550841337788ec74602293c285964060";
const WebSocket = require('ws');
const ccStreamer = new WebSocket('wss://streamer.cryptocompare.com/v2?api_key=' + apiKey);

ccStreamer.on('open', function open() {

    redisManager.subscribeToExistingSubscriptions(ccStreamer)

});

ccStreamer.on('message', function incoming(data) {
    
    console.log(data);

    limitNotificationLogic(data)
    repeatedLimitNotificationLogic(data)

});


async function connectToCryptoCompareWebSocket() {

// this is where you paste your api key
var apiKey = "dd470f89924f82d5f63d337a001d096c550841337788ec74602293c285964060";
const WebSocket = require('ws');
var ccStreamer = new WebSocket('wss://streamer.cryptocompare.com/v2?api_key=' + apiKey);

ccStreamer.on('open', function open() {
  
    // loop trough all of the pairs currently in redis and send them subscription request
    config.db.redisClient.lrange("exchanges",0,-1, (err, exchanges) => {

        if (err) console.log(err)

        var subs = []

        exchanges.forEach( (exchange) => {

            config.db.redisClient.hkeys(`pairs: ${exchange}`, (err, pairs) => {
               
                if (err) console.log(err)

                pairs.forEach( (pair) => {

                    var sub = `5~${exchange}~${pair}`

                    subs.push(sub)

                })

        
                var subRequest = {
                    "action": "SubAdd",
                    "subs": subs
                }
        
                ccStreamer.send(JSON.stringify(subRequest));

            })

        })



    })

});

ccStreamer.on('message', function incoming(data) {
    
    // 1. query the mongodb and fetch all notifications that match the fsym and tsym in the data
    // 2. loop trough the notifications and see if any notification needs to be fired.
    // if a notification needs to be fired then grab the user with the userId to get the token 
    // and fire the notification  
    
/*
    {
        TYPE: '5',
        MARKET: 'CCCAGG',
        FROMSYMBOL: 'BTC',
        TOSYMBOL: 'USD',
        FLAGS: 2,
        PRICE: 9238.79,
        LASTUPDATE: 1593669110,
        LASTTRADEID: '467912527',
        VOLUMEDAY: 3266.632854976875,
        VOLUMEDAYTO: 30215774.459492996,
        VOLUME24HOUR: 28515.896399454803,
        VOLUME24HOURTO: 263078581.81318298,
        VOLUMEHOUR: 708.0631935290904,
        VOLUMEHOURTO: 6552061.318247891,
        TOPTIERVOLUME24HOUR: 26715.490558604797,
        TOPTIERVOLUME24HOURTO: 246414059.60023063
      }
*/

        let tick = JSON.parse(data)
        limitNotificationLogic(tick)


});

config.db.ccStreamer = ccStreamer

return

}
function limitNotificationLogic(tick) {
    LimitNotification.find({exchange: tick.MARKET, fsym: tick.FROMSYMBOL, tsym:tick.TOSYMBOL, repeated:false}, function (err, notifications) {

        if (err) console.log(err)

        notifications.forEach( (notification) => {

            if (notification.status == NotificationStatus.DISABELD) return

            if (notification.direction == NotificationDirection.BIGGER_THAN) {

                if(tick.PRICE > notification.limit) {
                    
                    let message = `${notification.fsym} price is now more than ${notification.limit}`
                    sendPriceLimitNotification(notification,message)
                }
            }
            else {
                if(tick.PRICE < notification.limit) {
                    
                    let message = `${notification.fsym} price is now less than ${notification.limit}`
                    sendPriceLimitNotification(notification,message)

            }
            }
        })

    });
}
function repeatedLimitNotificationLogic(tick) {
   
    LimitNotification.find({exchange: tick.MARKET, fsym: tick.FROMSYMBOL, tsym:tick.TOSYMBOL, repeated:true}, function (err, notifications) {

        if (err) console.log(err)

        notifications.forEach( (notification) => {

            if (notification.status == NotificationStatus.DISABELD)  {
                if (notification.direction == NotificationDirection.BIGGER_THAN) {

                    if(tick.PRICE < notification.limit) {
                        notification.status = NotificationStatus.ENABLED
                        notification.save()
                    }
                }
                else if (notification.direction == NotificationDirection.SMALLER_THAN){
                    if(tick.PRICE > notification.limit) {
                        notification.status = NotificationStatus.ENABLED
                        notification.save()
                    }
            }
            }
            else if (notification.status == NotificationStatus.ENABLED) {
                if (notification.direction == NotificationDirection.BIGGER_THAN) {

                    if(tick.PRICE > notification.limit) {
                        
                            let message = `${notification.fsym} price is now more than ${notification.limit}`
                            sendPriceLimitNotification(notification,message)

                    }
                }
                else {
                    if(tick.PRICE < notification.limit) {

                        let message = `${notification.fsym} price is now less than ${notification.limit}`
                        sendPriceLimitNotification(notification,message)

                }
            }

            }
        })

    });
}
function sendPriceLimitNotification(notification,message) {

    User.findById(notification.userId, (err,user) => {
        PushNotificationManager.sendNotification(user.token,message)
        notification.status = NotificationStatus.DISABELD
        notification.save()
    })
}

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


userRoutes(app,redisManager)

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

function addExchange(exchange, client) {

    client.lpush("exchanges",exchange, (err, number) => {
        if (err) console.log(err)
        console.log(`number of elements added: ${number}`)
    })
}

async function addPairToPairsMap(pair,exchange, client) {


    // check if the vale exists for key
    return new Promise((resolve, reject) => {
    
        client.hget(`pairs: ${exchange}`,pair, (getErr,object) => {
            
            if (getErr) reject(getErr)
            if(!object) {

                client.hset(`pairs: ${exchange}`,pair,1 , (setErr,newObject) => {
                    if (setErr) reject('object not set')
                    console.log(`new key/value pair added: ${newObject}`)
                    resolve(newObject)
                })

            }
            else {
                client.hincrby(`pairs: ${exchange}`,pair,1, (err, number) => {

                    if (err) reject(err)
                    resolve(number)
                })
            }


        })

    })

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