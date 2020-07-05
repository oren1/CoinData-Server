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


module.exports = {
    addExchange,
    addPairToPairsMap
}