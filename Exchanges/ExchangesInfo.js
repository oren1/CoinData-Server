const BitfinexManager = require("./ExchangeManagers/BitfinexManager")

var PermissionKeys = {
    API_KEY: "apiKey",
    API_SECRET: "apiSecret",
    USER_ID: "userId"
}

var exchanges = {
    bitfinex: {
        name: "bitfinex",
        logoUrl: "https://www.cryptocompare.com/media/37071996/bitfinex.png",
        instructions: ["string1", "string2","string3","string4"],
        permissionKeys: [PermissionKeys.API_KEY,PermissionKeys.API_SECRET]
    }
}


var exchangesManagers = {
    bitfinex: BitfinexManager
}

module.exports = {
    exchanges,
    PermissionKeys,
    exchangesManagers
}