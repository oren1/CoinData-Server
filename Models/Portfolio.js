var mongoose = require('mongoose')
var Schema = mongoose.Schema


const PortfolioType = {
    MANUAL: 'manual',
    EXCHANGE: 'exchange'
}

var CoinBalanceSchema = new Schema({
    symbol: { type: String, required: true },
    amount: { type: Number, required: true }
})

var PortfolioSchema = new Schema({
    userId: { type: String, required: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    balance: { type: [CoinBalanceSchema] },
    dateCreated: {type: Number, required: true, default: Date.now() }
})

var ManualPortfolioSchema = new mongoose.Schema({
})

var ExchangePortfolioSchema = new mongoose.Schema({
    exchangeName: { type: String, required: true },
    token: { type: String, required: true }
})


var CoinBalance = mongoose.model("CoinBalance",CoinBalanceSchema)
var Portfolio = mongoose.model("Portfolio", PortfolioSchema)
var ManualPortfolio = Portfolio.discriminator("ManualPortfolio",ManualPortfolioSchema)
var ExchangePortfolio = Portfolio.discriminator("ExchangePortfolio",ExchangePortfolioSchema)


module.exports = {
    CoinBalance,
    Portfolio,
    ManualPortfolio,
    ExchangePortfolio,
    PortfolioType
}