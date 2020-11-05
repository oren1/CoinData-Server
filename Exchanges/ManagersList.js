const BitfinexManager = require("./ExchangeManagers/BitfinexManager")
const BinanceManager = require("./ExchangeManagers/BinanceManager")
const KuCoinManager = require("./ExchangeManagers/KuCoinManager")

var exchangesManagers = {
    bitfinex: BitfinexManager,
    binance: BinanceManager,
    kucoin: KuCoinManager
}

module.exports = {
    exchangesManagers
}