const CryptoJS = require('crypto-js') // Standard JavaScript cryptography library
const { PermissionKeys } = require("../ExchangesInfo")
const { encryptData, decryptCipher } = require("../CryptoHandler")()
const request = require('request') // "Request" HTTP req library

const apiPath = 'v2/auth/r/wallets'// Example path

function createToken(params) {

    if (PermissionKeys.API_KEY in params && PermissionKeys.API_SECRET in params) {

        var key = params[PermissionKeys.API_KEY]
        var secret = params[PermissionKeys.API_SECRET]

        var data = [ {apiKey: key}, {apiSecret: secret} ]
 
        // Encrypt
         let token = encryptData(data)
 
        return token
    }

    else throw new Error("api key or secret are missing")
}

function getBalance(exchangeToken, callback) {
    
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
        
        if (error) callback(error)

        let array = body
        if (array[0] == 'error') { // Handle Error
             callback(array)
        }
        else { // Handle Success
            callback(error, array)
        }
    })
}

module.exports = {
    createToken,
    getBalance
}