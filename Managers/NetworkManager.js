const request = require('request');

function getCoinsRates(callBack) {
    let url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?CMC_PRO_API_KEY=5f08a8f7-e9e0-4a12-8ee2-8e7b87b046f9&start=1&limit=2000&convert=USD"
    request(url, { json: true }, (err, res, body) => {
         if (err) { return console.log(err); }

         callBack(body.data)

    })
}


module.exports = {
    getCoinsRates
}