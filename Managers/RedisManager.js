let redisClient = null
let ccStreamer = null

async function addPairToPairsMap(pair,exchange) {

    // check if the vale exists for key
    return new Promise((resolve, reject) => {
    
        redisClient.hget(`pairs: ${exchange}`,pair, (getErr,object) => {
            console.log("hget")

            if (getErr) reject(getErr)
            if(!object) {

                redisClient.hset(`pairs: ${exchange}`,pair,1 ,(setErr,newObject) => {
                    if (setErr) reject(setErr)

                        // Add the subscription of the pair that was added now
                        var subRequest = {
                            "action": "SubAdd",
                            "subs": [`5~${exchange}~${pair}`]
                        }
                        ccStreamer.send(JSON.stringify(subRequest)) 

                    resolve(newObject)
                })

            }
            else {
                redisClient.hincrby(`pairs: ${exchange}`,pair,1, (err, number) => {
                    console.log("hincrby")

                    if (err) reject(err)
                    resolve(number)
                })
            }


        })

    })

}

async function addPriceToPriceMap(pair,exchange,price) {

    // check if the vale exists for key
    return new Promise((resolve, reject) => {
    
        redisClient.hset(`price: ${exchange}`,pair,price , (setErr,newObject) => {
            if (setErr) reject(setErr)
            resolve(newObject)
        })

    })

}

function subscribeToExistingSubscriptions(ccStreamer) {

    redisClient.keys("pairs*", (err, keys) => {
        if(err) console.log(err)

        keys.forEach( exchangeKey => {

            let exchange = exchangeKey.split(": ")[1]

            redisClient.hkeys(exchangeKey, (err, pairs) => {

                if(err) console.log(err) 
               
                var subs = []
                pairs.forEach( pair => {
                   var sub = `5~${exchange}~${pair}`
                    subs.push(sub)
                })

                var subRequest = {
                    "action": "SubAdd",
                     "subs": subs
                };

                ccStreamer.send(JSON.stringify(subRequest))

            })

        })
    })

}

async function removePairFromExchange(pair,exchange) {
    return new Promise((resolve, reject) => {

                redisClient.hget(`pairs: ${exchange}`, pair, (err, fieldValue) => {

                    if (err) reject(err)

                    if (fieldValue == null) resolve(fieldValue)

                    let amountOfSubscribers = parseInt(fieldValue,10)

                    if (amountOfSubscribers > 1) { // Decrease the number of subscribers by 1

                        redisClient.hincrby(`pairs: ${exchange}`,pair,-1, (err,fieldValue) => {
                            if (err) reject(err)
                            resolve(fieldValue)
                        })
                    }
                    else {

                        const multi = redisClient.multi();

                        multi.hdel(`pairs: ${exchange}`,pair)
                        multi.hdel(`price: ${exchange}`,pair)
    
                        multi.exec( (err, replies) => {
                           
                            if(err) reject(err) 

                            var subRequest = {
                                "action": "SubRemove",
                                "subs": [`5~${exchange}~${pair}`]
                            }
                            ccStreamer.send(JSON.stringify(subRequest))

                            resolve(replies)

                        })
                    }
                })
    })

}

async function replaceSubscriptions(oldPair,oldExchange,newPair,newExchange) {

    // decrease oldPair value if it's bigger than 1 and if it's not bigger than 1 remove it from the hash
    // plus increase newPair value by 1 if it exists and if the  newPair doesn't exist add it and set the value to
    // 1

    return new Promise( (resolve,reject) => {

        const multi = redisClient.multi()
        multi.hget(`pairs: ${oldExchange}`, oldPair)
        multi.hget(`pairs: ${newExchange}`, newPair)
        
        multi.exec( (err, replies) => {

            if (err) {
                console.log(err)
                reject(err)
            }
            else {
                let numberOfSubscriptionsToOldPair = replies[0]
                let numberOfSubscriptionsToNewPair = replies[1]

                // If there are more then one subscribers to the old pair 
                // then decrease the number of subscribers by 1 and if there is only 1 subscriber
                // then delete the key
                if (numberOfSubscriptionsToOldPair > 1) { 
                    multi.hincrby(`pairs: ${oldExchange}`,oldPair,-1)
                }
                else {

                    multi.hdel(`pairs: ${oldExchange}`, oldPair)
                    multi.hdel(`price: ${oldExchange}`,oldPair)

                    var subRequest = {
                        "action": "SubRemove",
                        "subs": [`5~${oldExchange}~${oldPair}`]
                    }
                    ccStreamer.send(JSON.stringify(subRequest))
                }

                // If there are no subscribers to the new pair then add a new pair and set it's value
                // to 1 and if the pair exists then increase the amount by1
                if (numberOfSubscriptionsToNewPair == null) {
                    multi.hset(`pairs: ${newExchange}`, newPair, 1)
                    // Add the subscription of the pair that was added now
                    var subRequest = {
                    "action": "SubAdd",
                    "subs": [`5~${newExchange}~${newPair}`]
                    }
                    ccStreamer.send(JSON.stringify(subRequest)) 
                }
                else {
                    multi.hincrby(`pairs: ${newExchange}`,newPair,1)
                }

                multi.exec( (err,replies) => {
                    if (err) reject(err)
                    else resolve(replies)
                })

            }
    
        })

    })

}

async function getPrice(pair,exchange) {

    return new Promise( (resolve,reject) => {

        redisClient.hget(`price: ${exchange}`,pair, (err, price) => {

            if(err) reject(err)
            resolve(price)
        })
    })
}

async function removeAllKeys() {
  
    return new Promise( (resolve, reject) => {

        var totalNumberOfKeysRemoved = 0

        redisClient.scan('0', (err, object) => {

            let cursor = object[0]
            let keys = object[1]

            if (keys.length == 0) resolve("no keys to remove")

            redisClient.del(keys, (err,numberOfKeysRemoved) => {

                    if(err) reject(err)
                    totalNumberOfKeysRemoved += numberOfKeysRemoved

                    if (cursor == '0') {
                        resolve(totalNumberOfKeysRemoved)
                    }
            })

        })

    })
}

async function isMemberOfSubscriptions(member) {

    return new Promise( (resolve, reject) => {

        redisClient.sismember("subscriptions", member, (err, number) => {
            if (err) reject(err)
            resolve(number)
        })
    })
}

async function addToSubscriptions(member) {
   
    return new Promise( (resolve, reject) => {

        redisClient.sadd("subscriptions", member, (err, number) => {
            if (err) reject(err)
            if (number == "1") {

                let sub = `5~${member}`
                if (!member.includes("CCCAGG")) {
                    sub = `2~${member}`
                }

                // subsribe to crypto compare 
                var subRequest = {
                    "action": "SubAdd",
                    "subs": [sub]
                }

                console.log(subRequest)

                ccStreamer.send(JSON.stringify(subRequest)) 
            }
            resolve(number)  
        })
    })
}

async function removePrice(exchange, fsym, tsym) {

    return new Promise( (resolve,reject) => {
        let field = fsym +"~"+tsym
        redisClient.hdel(`price: ${exchange}`,field, (err, number) => {
            if (err) reject(err)
            else resolve(number)
        })
    })
}

async function removeFromSubscriptions(member) {
   
    return new Promise( (resolve, reject) => {

        redisClient.srem("subscriptions",member, (err, number) => {
            if (err) reject(err)

            let sub = `5~${member}`
            if (!member.includes("CCCAGG")) {
                sub = `2~${member}`
            }
            // remove from crypto compare 
            var subRequest = {
                "action": "SubRemove",
                "subs": [sub]
            }

            console.log(subRequest)

            ccStreamer.send(JSON.stringify(subRequest))
            resolve(number)  
        })
    })
}

module.exports = (_client, _ccStreamer) => {

    if(!_client) throw new Error("missing redis client")

    if(!_ccStreamer) throw new Error("Missing ccStreamer object")
    
    redisClient = _client
    ccStreamer = _ccStreamer

    return {
        isMemberOfSubscriptions,
        addToSubscriptions,
        removeFromSubscriptions,
        addPairToPairsMap,
        addPriceToPriceMap,
        subscribeToExistingSubscriptions,
        removePairFromExchange,
        replaceSubscriptions,
        getPrice,
        removePrice,
        removeAllKeys
    }
}