const CryptoJS = require('crypto-js') // Standard JavaScript cryptography library
const { PermissionKeys } = require("../ExchangesInfo")
const { encryptData, decryptCipher } = require("../CryptoHandler")()
const request = require('request') // "Request" HTTP req library

const apiPath = '/api/v3/account'

function parseQRCode(code) {
    let codeObject = JSON.parse(code)
    if ("apiKey" in codeObject && "secretKey" in codeObject) {
        let apiKey = codeObject.apiKey
        let secretKey = codeObject.secretKey

        return {
            [PermissionKeys.API_KEY]: apiKey,
            [PermissionKeys.API_SECRET]: secretKey
        }
    }
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
       
        const Timestamp = Date.now().toString()
    
        const body = {}
        body.timestamp = Timestamp
        // body.type = "SPOT"
    
        let totalParams = Object.keys(body).map(function (key) {
            return key + '=' + body[key]
        }).join('&')
    
        const signature = CryptoJS.HmacSHA256(totalParams, apiSecret).toString()
    
        body.signature = signature
    
        let queryString = Object.keys(body).map(function (key) {
            return key + '=' + body[key]
        }).join('&')
    
        const options = {
            url: `https://api.binance.com${apiPath}?${queryString}`,
            headers: {
                'X-MBX-APIKEY': apiKey
            },
            // body: body,
            json: true
        }


        request.get(options, (error, response, body) => {

            if (error) { // Network Error
                reject(error)
            }
            else if ("code" in body) { // "code" will be in the response body only if there 
            // is an error in the request
                reject(Error(body.msg))
            }
            else { // Handle Success
                         
                let balances = body.balances
                let balance = []
                balances.forEach(coin => {
                    let freeBalanceAmount = coin["free"]
                    if (freeBalanceAmount > 0) {
                        balance.push({symbol: coin["asset"], amount: coin["free"]})
                    }
                })
                resolve(balance)
            }
    })


        
    })
}

module.exports = {
    getBalance,
    createToken,
    parseQRCode
}