const CryptoJS = require('crypto-js') // Standard JavaScript cryptography library
const request = require('request') // "Request" HTTP req library
const { PermissionKeys } = require("../ExchangesInfo")
const { encryptData, decryptCipher } = require("../CryptoHandler")()

const apiPath = '/api/v1/accounts'

function parseQRCode(code) {

    return {
        [PermissionKeys.API_SECRET]: code
    }

}

function createToken(params) {

    if (PermissionKeys.API_KEY in params && PermissionKeys.API_SECRET in params 
        && PermissionKeys.USER_ID in params ) {

        var key = params[PermissionKeys.API_KEY]
        var secret = params[PermissionKeys.API_SECRET]
        var passphrase = params[PermissionKeys.USER_ID]

        var data = {[PermissionKeys.API_KEY]: key, 
                    [PermissionKeys.API_SECRET]: secret, 
                    [PermissionKeys.USER_ID]: passphrase}
 
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
        let passPhrase = params[PermissionKeys.USER_ID]
    
        const timestamp = Date.now().toString() // Standard nonce generator. Timestamp * 1000
        
        let body = {}
        let message = `${timestamp}GET${apiPath}`
        console.log(message)

        let hash = CryptoJS.HmacSHA256(message,apiSecret)
        var base64Signature = CryptoJS.enc.Base64.stringify(hash)
    
        const options = {
            url: `https://api.kucoin.com${apiPath}`,
            headers: {
                'KC-API-KEY': apiKey,
                'KC-API-SIGN': base64Signature,
                'KC-API-TIMESTAMP': timestamp,
                'KC-API-PASSPHRASE': passPhrase
            },
            json: true
        }
    
    
        request.get(options, (error, response, body) => {
            
            if (error) reject(error)
            if (body.code != 200000) { // Handle Error
                let error = new Error(body.msg)
                reject()
            }
            else {
                let balance = []
                let balances = body.data
                balances.forEach( coinBalance => {
                    balance.push({symbol: coinBalance["currency"], amount: coinBalance["available"]})
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