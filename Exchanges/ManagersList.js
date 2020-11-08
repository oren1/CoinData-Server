const BitfinexManager = require("./ExchangeManagers/BitfinexManager")
const BinanceManager = require("./ExchangeManagers/BinanceManager")
const KuCoinManager = require("./ExchangeManagers/KuCoinManager")
const BitstampManager = require("./ExchangeManagers/BitstampManager")

var exchangesManagers = {
    bitfinex: BitfinexManager,
    binance: BinanceManager,
    kucoin: KuCoinManager,
    bitstamp: BitstampManager
}

module.exports = {
    exchangesManagers
}