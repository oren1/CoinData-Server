const CryptoJS = require('crypto-js') // Standard JavaScript cryptography library
const { PermissionKeys } = require("../ExchangesInfo")
const { encryptData, decryptCipher } = require("../CryptoHandler")()
const request = require('request') // "Request" HTTP req library

const apiPath = 'v2/auth/r/wallets'// Example path

function parseQRCode(code) {
    let JSON = {}
    let array = code.split('-')
    for (const pairString of array) {
        let pair = pairString.split(":")
        let key = pair[0]
        let value = pair[1]

        switch (key) {
            case "key":
                JSON[PermissionKeys.API_KEY] = value
                break;
            case "secret":
                 JSON[PermissionKeys.API_SECRET] = value
                 break;
            default:
                break;
        }
    }

    return JSON
}

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

    const nonce = (Date.now() * 1000).toString() // Standard nonce generator. Timestamp * 1000
    const body = {} // Field you may change depending on endpoint

    let signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}`
    // Consists of the complete url, nonce, and request body

    const sig = CryptoJS.HmacSHA384(signature, apiSecret).toString()
    // The authentication signature is hashed using the private key

    const options = {
        url: `https://api.bitfinex.com/${apiPath}`,
        headers: {
            'bfx-nonce': nonce,
            'bfx-apikey': apiKey,
            'bfx-signature': sig
        },
        body: body,
        json: true
    }


    request.post(options, (error, response, body) => {
        
        if (error) reject(error)

        let array = body
        if (array[0] == 'error') { // Handle Error
            let errorMessage = array[2]
            let error = new Error(errorMessage)
            reject(error)
        }
        else { // Handle Success
            let balance = []
            array.forEach(coin => {
                balance.push({symbol: coin[1], amount: coin[2]})
            })
            resolve(balance)
        }
    })

   }) 

}

module.exports = {
    parseQRCode,
    createToken,
    getBalance
}
