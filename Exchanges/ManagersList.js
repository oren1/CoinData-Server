const BitfinexManager = require("./ExchangeManagers/BitfinexManager")
const BinanceManager = require("./ExchangeManagers/BinanceManager")

var exchangesManagers = {
    bitfinex: BitfinexManager,
    binance: BinanceManager
}

module.exports = {
    exchangesManagers
}