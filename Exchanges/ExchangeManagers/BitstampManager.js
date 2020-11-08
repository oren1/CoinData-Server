const CryptoJS = require('crypto-js') // Standard JavaScript cryptography library
const request = require('request') // "Request" HTTP req library
const { PermissionKeys } = require("../ExchangesInfo")
const { encryptData, decryptCipher } = require("../CryptoHandler")()
const { v4: uuidv4 } = require('uuid');


const apiPath = '/api/v2/balance/'// Example path

function createToken(params) {

    if (PermissionKeys.API_KEY in params && PermissionKeys.API_SECRET in params) {

        var key = params[PermissionKeys.API_KEY]
        var secret = params[PermissionKeys.API_SECRET]

        var data = {apiKey: key, apiSecret: secret}
 
        // Encrypt
         let token = encryptData(data)
 
        return token
    }

    else throw new Error("api key or secret are missing")
}

function getBalance(exchangeToken) {
    
    return new Promise( (resolve,reject) => {

        let params = decryptCipher(exchangeToken)
        let apiKey = params[PermissionKeys.API_KEY]
        let apiSecret = params[PermissionKeys.API_SECRET]
        
        const timestamp = Date.now().toString() // Standard nonce generator. Timestamp * 1000
        const nonce = uuidv4() // Creates a random UUID

         let body = { 
            //  offset: '1' 
        } // Field you may change depending on endpoint
        
        const stringToSign = 
        "BITSTAMP" + " " + apiKey
        + "POST"
        + "www.bitstamp.net"
        + apiPath
        + 'application/x-www-form-urlencoded'
        + nonce
        + timestamp
        + 'v2'
        + JSON.stringify(body)

        console.log(stringToSign)

        const hash = CryptoJS.HmacSHA256(stringToSign, apiSecret)
        var signature = CryptoJS.enc.Base64.stringify(hash).toUpperCase()
    


        const options = {
            url: `https://www.bitstamp.net${apiPath}`,
            headers: {
                'X-Auth': "BITSTAMP" + " " + apiKey,
                'X-Auth-Nonce': nonce,
                'X-Auth-Timestamp': timestamp,
                'X-Auth-Signature': hash.toString(),
                'X-Auth-Version': 'v2',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: JSON.stringify(body),
            json: true
        }
    
        request.post(options, (error, response, body) => {
            
            if (error) reject(error)
            if (response.statusCode !== 200) {
                let error = new Error(body.reason)
                reject(error)
            }
            else {
                let balance = []
                for (let [key, value] of Object.entries(body)) {
                    if (key.includes("balance")) {

                        if (value > 0) {
                            let symbol = key.split("_")[0]
                            balance.push({symbol: symbol.toUpperCase(), amount: value})
                        }

                    }
                }

                resolve(balance)
            }

            //{ status: 'error', reason: 'Wrong API key format', code: 'API0011' }
            // { status: 'error', reason: 'Invalid signature', code: 'API0005' }
        })

    })


}

module.exports = {
    getBalance,
    createToken
}