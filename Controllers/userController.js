const { validationResult } = require('express-validator')
const User = require("../Models/User")
const { Portfolio, ManualPortfolio, ExchangePortfolio, CoinBalance, PortfolioType } = require("../Models/Portfolio")
const { Notification, LimitNotification, IntervalNotification, NotificationType, NotificationStatus}  = require("../Models/Notification")
const { exchanges } = require("../Exchanges/ExchangesInfo")
const { exchangesManagers } = require("../Exchanges/ManagersList")
const { Settings } = require("../Models/Settings")
const mongoose = require('mongoose')

const ResponseKey = {
    Success: "success",
    Message: "message",
    Data: "data"
}

let redisManager = null
let ccStreamer = null

const createUser = (req,res) => {

    const user = new User(req.body)

    user.save( (err,newUser) => {

        if (err) res.json(err)
        res.json(newUser)

    })
}

const createNotification = (req,res) => {
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    let notificationType = req.params.notificationType

    switch (notificationType) {
        case NotificationType.LIMIT_NOTIFICATION: {
    
            const limitNotification = new LimitNotification(req.body)

            limitNotification.save( async (err, notification) => {

                if(err) res.json(err)
                else {
                    try {
                        await addSubscriptionIfNeeded(notification)
                        res.json(notification)
    
                    } catch (error) {
                        res.json({error: error})
    
                    }
                }

        })
            
            break;
        }

         case NotificationType.INTERVAL_NOTIFICATION: {
    
            const intervalNotification = new IntervalNotification(req.body)
            intervalNotification.save( async (err,notification) => {
                    
                if (err) res.json(err)
                else {
                    try {
                        await addSubscriptionIfNeeded(notification)
                        res.json(notification)
    
                    } catch (error) {
                        res.json({error: error})
    
                    }
                }

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

        if (err) res.json(err)
        else {
            res.json(userDoc)
        }
    })

}

const updateNotificationStatus = async (req,res) => {
    
     if (!("status" in req.body)) return res.json({error: "missing 'status' key"})

    let oldNotification = null
    try {
        oldNotification = await Notification.findOne({_id: req.body.id})
    } catch (error) {
       return res.json(error)
    } 

    Notification.findOneAndUpdate({_id: req.body.id}, {status: req.body.status}, {new: true}, async (err, notification) => {

            if (err) res.json(err)

            if (oldNotification.status == NotificationStatus.DISABLED &&
                notification.status == NotificationStatus.ENABLED) {

                    try {
                        await addSubscriptionIfNeeded(notification)
                        res.json(notification)
    
                    } catch (error) {
                        res.json({error: error})
    
                    }
        
            }
        
            // If notification moved from enabeld to disabeld then unsubscribe to it
            else if (oldNotification.status == NotificationStatus.ENABLED &&
                notification.status == NotificationStatus.DISABLED) {

                    res.json(notification)

            }

            else {
                res.json({error: "no change in status"})
            }

    })

}

const updateNotification = async (req,res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    if ("status" in req.body) res.json({error: "request contains 'status' key"})
   
    let notificationType = req.params.notificationType

    switch (notificationType) {
        case NotificationType.LIMIT_NOTIFICATION: {
         
            LimitNotification.findOneAndUpdate({_id: req.body.id}, req.body,{ new: true}, async (err, notification) => {
                
                if (err) return res.json(err)
                if (!notification) return res.json("notification not found")

                try {
                    await addSubscriptionIfNeeded(notification)
                    res.json(notification)

                } catch (error) {
                    res.json({error: error})

                }

            })

            break
        }
            
        case NotificationType.INTERVAL_NOTIFICATION: {

            req.body.startTime = Date.now()
            
            IntervalNotification.findOneAndUpdate({_id: req.body.id}, req.body,{ new: true}, async (err, notification) => {
                
                if (err) return res.json(err)
                if (!notification) return res.json("notification not found")
             
                try {
                    await addSubscriptionIfNeeded(notification)
                    res.json(notification)

                } catch (error) {
                    res.json({error: error})

                }

            })

            break
        } 

        default:
            break;
    }

}

const deleteNotification = (req,res) => {

    Notification.findOneAndDelete({_id: req.body.id}, (err,notification) => {

        if (err) res.json(err)
        else {
            res.json(notification)
        }
        
    })

}

const getNotifications = (req,res) => {

    Notification.find({userId: req.body.userId}, (err, notifications) => {
        if (err) res.json(err)
        else res.json({notifications: notifications})
    })

}

async function addSubscriptionIfNeeded(notification) {             
    try {
        let subscriptionString = notification.getSubscriptionString()
        let isMember = await redisManager.isMemberOfSubscriptions(subscriptionString)
        if (!isMember) {
            await redisManager.addToSubscriptions(subscriptionString)
        }
    } catch (error) {
        throw error
    }
}

const addPortfolio = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    let portfolioType = req.body.type
    switch (portfolioType) {
        case PortfolioType.MANUAL:{
            let manualPortfolio = new ManualPortfolio(req.body)
            manualPortfolio.save( (err, portfolio) => {
                if (err) res.json({ 
                    [ResponseKey.Success]: false,
                    [ResponseKey.Message]: "error saving portfolio - try again later",
                })
                else res.json({ 
                    [ResponseKey.Success]: true,
                    [ResponseKey.Message]: "portfolio created successfully",
                    [ResponseKey.Data]: portfolio
                })
            })

            break;
        }
               
        case PortfolioType.EXCHANGE:{

                        if (!("exchangeName" in req.body)) {
                            res.json({error: "'exchangeName' not in request body"}) 
                            return
                        }

                        let exchangeName = req.body["exchangeName"]
                        let exchangeManager = exchangesManagers[exchangeName]
                        try {
                            
                           let token = exchangeManager.createToken(req.body)
                           // Making a fetch to the balance to check that the exchange keys the user sent 
                           // are correct and supported by the exchange
                           await exchangeManager.getBalance(token)
                           req.body.token = token 

                           let exchangePortfolio = new ExchangePortfolio(req.body)
                           exchangePortfolio.save( (err, portfolio) => {
                                if (err) res.json({ 
                                    [ResponseKey.Success]: false,
                                    [ResponseKey.Message]: "error saving portfolio - try again later",
                                })
                                else res.json({ 
                                    [ResponseKey.Success]: true,
                                    [ResponseKey.Message]: "portfolio created successfully",
                                    [ResponseKey.Data]: portfolio
                                })
                           })
           
                        } catch (err) {
                            res.json({ 
                                [ResponseKey.Success]: false,
                                [ResponseKey.Message]: err.message,
                            })
                        }
           
                       break;
        }
        default:
    }
}

const myPortfolios = async (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    Portfolio.find({userId: req.body.userId}, (err, portfolios) => {

        if(err) res.json({error: err})
        else res.json({portfolios: portfolios})
    })
}

const supportedExchanges = async (req, res) => {
    res.json(exchanges)
}

const getBalanceForExchange = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    let exchangeName = req.body.exchangeName
    let token = req.body.token
    let portfolioId = req.body.portfolioId

    let exchangeManager = exchangesManagers[exchangeName]
    exchangeManager.getBalance(token).
    then( balance => {
        res.json({balance: balance})
    })
    .catch(error => {
        res.json({error: error})
    })
}

const addCoinBalance = (req, res) => {

    let portfolioId = req.body.portfolioId
    Portfolio.findOne({_id: portfolioId}, async (err, portfolio) => {
        
        if (err) return res.json({error: err})
        if (portfolio.type == PortfolioType.EXCHANGE) {
            return res.json({error: "can't add coin balance to 'exchange' type portfolio"})
        } 
 
        portfolio.balance.push({symbol:req.body.symbol, amount:req.body.amount})
        try {
            await portfolio.save()
            res.json(portfolio)
        } catch (error) {
            res.json({error: err})
        }
    })
}

const updateCoinBalance = async (req, res) => {

    let portfolioId = req.body.portfolioId
    let symbol = req.body.symbol
    let amount = req.body.amount

    Portfolio.findById(portfolioId, async (err, portfolio) => {
        if (err) return res.json({error: err})
        if (portfolio == null) return res.json({error: "porfolio not exists"})

        for(coinBalance of portfolio.balance) {
          
            if (coinBalance.symbol == symbol) {
                coinBalance.amount = amount
            }
        }

        try {
            await portfolio.save()
            res.json(portfolio)

        } catch (error) {
            res.json({error: error})
        }

    })
}

const deletePortfolio = async (req, res) => {

    let portfolioId = req.body.portfolioId
    Portfolio.findOneAndDelete({_id: portfolioId}, (err, portfolio) => {
        if (err) return res.json({error: err})
        res.json(portfolio)
    })
}

const parseQRCode = async (req, res) => {

    let exchangeName = req.body.exchangeName
    let code = req.body.code

    let exchangeManager = exchangesManagers[exchangeName]
    if (exchangeManager == null) res.json({error: `exchange named '${exchangeName}' doesn't exist`})
   
    let JSON = exchangeManager.parseQRCode(code)
    res.json(JSON)
}


const settings = async (req, res) => {
   
    let settings = {
        maxAmountOfIntervalNotification: 2,
        maxAmountOfLimitNotification: 3,
        maxAmountOfPortfolios: 3,
        fetchDataTimeInterval: Date.now() + (1000 * 60 * 60 * 24) // fetch data once in 24 hours
    }

    res.json({settings: settings})

}

module.exports = (_redisManager, _ccStreamer) => {

    if(!_redisManager) throw new Error("Missing redis manager")
    if(!_ccStreamer) throw new Error("Missing ccStreamer object")

    redisManager = _redisManager
    ccStreamer = _ccStreamer

    return {

        createUser,
        createNotification,
        updateUserToken,
        updateNotification,
        updateNotificationStatus,
        getNotifications,
        deleteNotification,
        addPortfolio,
        myPortfolios,
        supportedExchanges,
        getBalanceForExchange,
        addCoinBalance,
        updateCoinBalance,
        deletePortfolio,
        parseQRCode,
        settings
    }

}