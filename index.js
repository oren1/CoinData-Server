const dotenv = require("dotenv").config()
const mongoose = require('mongoose')
var redis = require('redis');
const User = require('./Models/User')
const { LimitNotification, NotificationDirection, NotificationStatus, IntervalNotification, Notification , RepeatedState} = require("./Models/Notification")
const express = require("express")
const bodyParser = require("body-parser")
const NetworkManager = require("./Managers/NetworkManager")
const userRoutes = require("./Routes/userRoutes")
const PushNotificationManager = require("./Managers/PushNotificationManager")
const PORT = "4018"
const config = require("./config/configuration")
const RedisManager = require("./Managers/RedisManager")
const ReconnectingWebSocket = require('reconnecting-websocket') 


var MongoClient = require('mongodb').MongoClient;

let mongodb = "mongodb+srv://dbuser:atlas123456@cluster0-rhuii.mongodb.net/Users?retryWrites=true&w=majority"
let redisSettings = {
    port: 16468, 
    host:"redis-16468.c44.us-east-1-2.ec2.cloud.redislabs.com",
    auth_pass: "1xlJwJ1y9W359HyheAWWuXqNiKouQyzv",                                                                                                                                             
}

if (process.env.MONGO_DB_URL) {
    mongodb = process.env.MONGO_DB_URL
}

if (process.env.REDIS_URL) {
    redisSettings = {
        port: process.env.REDIS_PORT, 
        host: process.env.REDIS_URL,
        auth_pass: process.env.REDIS_PASS, 
    }
}

let redisManager = null

process.on('warning', function(w){
    console.log(' => Suman interactive warning => ', w.stack || w);
  })

initiateServer()

async function initiateServer() {

  try {

    let app = express()

    await mongoose.connect(mongodb, { useNewUrlParser: true, useUnifiedTopology: true ,useFindAndModify: false, useCreateIndex: true })
    console.log("mongoose")
    const redisClient = await createRedisClient()
    const ccStreamer = await createCryptoCompareStreamer()
    // ccStreamer.on('message', function incoming(data) {
       
    // // {
    // //     TYPE: 5,
    // //     MARKET: "CCCAGG",
    // //     FROMSYMBOL: "BTC",
    // //     TOSYMBOL: "USD",
    // //     FLAGS: 4,
    // //     PRICE: 9287.39,
    // //     LASTUPDATE: 1594203730,
    // //     MEDIAN: 9289,
    // //     LASTVOLUME: 0.02077,
    // //     LASTVOLUMETO: 192.8712585,
    // //     LASTTRADEID: 72033924,
    // //     VOLUMEDAY: 12686.421452815894,
    // //     VOLUMEDAYTO: 117751995.373741,
    // //     VOLUME24HOUR: 25740.369137112,
    // //     VOLUME24HOURTO: 238574938.52683517,
    // //     OPENDAY: 9257.3,
    // //     HIGHDAY: 9321.59,
    // //     LOWDAY: 9236.9,
    // //     OPEN24HOUR: 9250.05,
    // //     HIGH24HOUR: 9322.06,
    // //     LOW24HOUR: 9201.52,
    // //     LASTMARKET: "BTCAlpha",
    // //     VOLUMEHOUR: 358.99167771000094,
    // //     VOLUMEHOURTO: 3332665.889176361,
    // //     OPENHOUR: 9279.96,
    // //     HIGHHOUR: 9291.91,
    // //     LOWHOUR: 9279.04,
    // //     TOPTIERVOLUME24HOUR: 23771.441133582004,
    // //     TOPTIERVOLUME24HOURTO: 220359399.57789007,
    // //  }

    // let tick = JSON.parse(data)

    // if(tick.TYPE == 5) {
    //     // console.log(tick)
    //     console.log(tick)
    //     if (tick.PRICE) { // If the price didn't change than the PRICE is not included in the json object

    //         let pair = tick.FROMSYMBOL +"~"+ tick.TOSYMBOL
    //         let exchange = tick.MARKET
    //         let price = `${tick.PRICE}`
        
    //         redisManager.addPriceToPriceMap(pair, exchange, price)
    //     }

    //     updateSubscriptionsIfNeeded(tick)
    //     limitNotificationLogic(tick)
    // }

    // })


    ccStreamer.addEventListener('message', function incoming(json) {
       
            let data = json["data"]
            let tick = JSON.parse(data)

            if(tick.TYPE == 5) {
                // console.log(tick)
                if (tick.PRICE) { // If the price didn't change then the PRICE is not included in the json object
        
                    let pair = tick.FROMSYMBOL +"~"+ tick.TOSYMBOL
                    let exchange = tick.MARKET
                    let price = `${tick.PRICE}`
                
                    redisManager.addPriceToPriceMap(pair, exchange, price)
                }
        
                updateSubscriptionsIfNeeded(tick)
                limitNotificationLogic(tick)
            }
    
        })




    config.db.redisClient = redisClient
    redisManager = RedisManager(config.db.redisClient, ccStreamer)
    
    await buildRedisMap(ccStreamer)
    
    app.use(bodyParser.urlencoded({ extended: false }))
    
    // parse application/json
    app.use(bodyParser.json())
    
    
    userRoutes(app,redisManager,ccStreamer)
    
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

    setInterval(timeIntervalNotificationLogic,60000)


  } catch (error) {
      
        console.log(error)
  }  

}
async function createRedisClient() {

    return new Promise( (resolve,reject) => {

        let redisClient = redis.createClient(redisSettings)

        redisClient.on("ready", () => { 
            console.log(`redis connected`)
            resolve(redisClient)
        })
        
        redisClient.on('error', function (err) {
            console.log('redis error:' + err)
            console.log(err.stack)
            reject(err)
        });

    })
}
async function createCryptoCompareStreamer() {

    return new Promise( (resolve, reject) => {

        var apiKey = "dd470f89924f82d5f63d337a001d096c550841337788ec74602293c285964060";
        let WebSocket = require('ws');
        // let ccStreamer = new WebSocket('wss://streamer.cryptocompare.com/v2?api_key=' + apiKey)
        // ccStreamer.on('error', (err) => {
        //     reject(err)
        // })
        // ccStreamer.on('open', function open() {

        //     console.log("ccStreamer connected")
        //     resolve(ccStreamer)
        // })
        // ccStreamer.on('close',(code,reason) => {
            
        // })
         
    const options = {
        WebSocket: WebSocket, // custom WebSocket constructor
        connectionTimeout: 5000, // ms to wait between retries
    }
    const ccStreamer = new ReconnectingWebSocket('wss://streamer.cryptocompare.com/v2?api_key=' + apiKey, [], options)
        
    ccStreamer.addEventListener('open', () => {
            console.log("ccStreamer connected")
            resolve(ccStreamer)        
        })
        ccStreamer.addEventListener('error', () => {
          reject(err)
        })

    })

}
async function buildRedisMap(ccStreamer) {
    
    // 1. Remove  'pairs' and 'price' keys
    // 2. Grab all of the enabled notifications
    // 3. Loop trough the notifications and for each notification add it to the redis hash and subscribe if 
    // needed
   
    try {
        let numberOfKeysRemoved = await redisManager.removeAllKeys()
        let notifications = await Notification.find({status: 1}).exec()

        for (notification of notifications) {
            await redisManager.addToSubscriptions(notification.getSubscriptionString())
            // subsribe to crypto compare 
            var subRequest = {
                 "action": "SubAdd",
                 "subs": [`5~${notification.getSubscriptionString()}`]
            }
            ccStreamer.send(JSON.stringify(subRequest)) 

        }

    } catch (error) {
        console.log(error)

    }
}
function limitNotificationLogic(tick) {
    LimitNotification.find({exchange: tick.MARKET, fsym: tick.FROMSYMBOL, tsym:tick.TOSYMBOL, repeated:false}, function (err, notifications) {

        if (err) console.log(err)

        notifications.forEach( (notification) => {

            if (notification.status == NotificationStatus.DISABLED) return

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
            
            if (notification.status == NotificationStatus.DISABLED) return

            if (notification.repeatedState == RepeatedState.WAITING_LIMIT_BASE)  {
                    if (notification.direction == NotificationDirection.BIGGER_THAN) {

                        if(tick.PRICE < notification.limit) {
                            notification.repeatedState = RepeatedState.LIMIT_BASE
                            notification.save()
                        }
                    }
                    else if (notification.direction == NotificationDirection.SMALLER_THAN){
                       
                        if(tick.PRICE > notification.limit) {
                            notification.repeatedState = RepeatedState.LIMIT_BASE
                            notification.save()                        }
            }
            }
            else if (notification.repeatedState == RepeatedState.LIMIT_BASE) {
                    if (notification.direction == NotificationDirection.BIGGER_THAN) {

                        if(tick.PRICE > notification.limit) {
                            sendRepeatedPriceLimitNotification(notification)
                        }
                    }
                    else {

                        if(tick.PRICE < notification.limit) {
                            sendRepeatedPriceLimitNotification(notification)
                    }
            }

            }
        })

    })
}
function timeIntervalNotificationLogic() {

    // Fetch the time interval notifications, loop trough all of them and for each one check if now - startDate
    // is bigger than time interval
    console.log("timeIntervalNotificationLogic")
    IntervalNotification.find({status: 1}, (err, notifications) => {
        notifications.forEach( notification => {

            let timeElapsed = Date.now() - notification.startTime

            if (timeElapsed >= notification.interval) {
               
                User.findById(notification.userId, (err,user) => {

                    let pair = notification.getPair()
                    redisManager.getPrice(pair,notification.exchange).
                    then( price => {
                        let message = `${notification.fsym}/${notification.tsym} is now ${price}`
                        let collapseId = notification._id
                        PushNotificationManager.sendNotification(collapseId,user.token,message)
                    })
                    .catch( err => {
                        console.log(err)
                    })

                })

                notification.startTime = Date.now()
                notification.save()
            }

        })
    })
}
function sendRepeatedPriceLimitNotification(notification) {
  
    let message = null
    if (notification.direction == NotificationDirection.BIGGER_THAN) { 
        message = `${notification.fsym} price is now more than ${notification.limit}`
    }
    else {
       message = `${notification.fsym} price is now less than ${notification.limit}`
    }
    notification.repeatedState = RepeatedState.WAITING_LIMIT_BASE
    notification.save()

    User.findById(notification.userId, (err,user) => { 

        if (err) return console.log("user not found")
        PushNotificationManager.sendNotification(user.token,message)
    })

}
function sendPriceLimitNotification(notification,message) {
       
    User.findById(notification.userId, (err,user) => {
       
        if (err) return console.log(`couldn't find user with id: ${notification.userId}`)
        notification.status = NotificationStatus.DISABLED
        
        notification.save( (err, notification) => {

            if (err) return console.log("save error")
            let collapseId = notification._id
            PushNotificationManager.sendNotification(collapseId,user.token,message)
            //redisManager.removePairFromExchange(notification.getPair(), notification.exchange)
        })
    })
}
function updateSubscriptionsIfNeeded(tick) {

    Notification.countDocuments({exchange: tick.MARKET, fsym: tick.FROMSYMBOL, tsym: tick.TOSYMBOL, status: 1}, (err, count) => {
        if (count == 0) {
            let subscriptionString = tick.MARKET +"~"+ tick.FROMSYMBOL + "~" + tick.TOSYMBOL
            redisManager.removeFromSubscriptions(subscriptionString)
            redisManager.removePrice(tick.MARKET,tick.FROMSYMBOL,tick.TOSYMBOL)
        }
    })
}