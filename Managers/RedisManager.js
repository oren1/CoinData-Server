let redisClient = null

function addExchange(exchange) {

    redisClient.lpush("exchanges",exchange, (err, number) => {
        if (err) console.log(err)
        console.log(`number of elements added: ${number}`)
    })
}

async function addPairToPairsMap(pair,exchange) {


    // check if the vale exists for key
    return new Promise((resolve, reject) => {
    
        redisClient.hget(`pairs: ${exchange}`,pair, (getErr,object) => {
            
            if (getErr) reject(getErr)
            if(!object) {

                redisClient.hset(`pairs: ${exchange}`,pair,1 , (setErr,newObject) => {
                    if (setErr) reject('object not set')
                    console.log(`new key/value pair added: ${newObject}`)
                    resolve(newObject)
                })

            }
            else {
                redisClient.hincrby(`pairs: ${exchange}`,pair,1, (err, number) => {

                    if (err) reject(err)
                    resolve(number)
                })
            }


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

        redisClient.hincrby(`pairs: ${exchange}`,pair,-1, (err, fieldValue) => {

            if(err) reject(err)

            if(fieldValue == 0) { // if the pair's fieldValue is 0 it means that no notification with the pair 
            //exists and the subscription should be removed. 

                redisClient.hdel(`pairs: ${exchange}`,pair, (err, numberOfFirldsRemoved) => {
                    if (numberOfFirldsRemoved == 1) {
                        resolve(fieldValue)
                    }
                    else reject(fieldValue)
                })
            }
            else {
                resolve(fieldValue)
            }

        })
    })

}

module.exports = (_client) => {

    if(!_client) throw new Error("missing redis client")

    redisClient = _client

    return {

        addExchange,
        addPairToPairsMap,
        subscribeToExistingSubscriptions,
        removePairFromExchange
    }
}