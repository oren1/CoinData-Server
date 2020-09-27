const BitfinexManager = require("./ExchangeManagers/BitfinexManager")

var exchangesManagers = {
    bitfinex: BitfinexManager
}

module.exports = {
    exchangesManagers
}