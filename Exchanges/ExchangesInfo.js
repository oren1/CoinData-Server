const PermissionKeys = {
    API_KEY: 'apiKey',
    API_SECRET: 'apiSecret',
    USER_ID: 'apiUserId',
}

const exchanges = {
    exchanges:[
        {
            name: "Bitfinex",
            keyName: "bitfinex",
            logoUrl: "https://www.cryptocompare.com/media/37071996/bitfinex.png",
            instructions: ["1. Log in to your Bitfinex account and go to Account -> API\n", 
            "2. Select Create new key tab\n",
            "3. Select all read boxes, it should be selected by default.\n",
            "4. Label your API KEY\n",
            "5. Scan the QR Code or enter the api key and api secret manualy"],

            permissionKeys: [ 
                {
                    key: PermissionKeys.API_KEY,
                    keyTitle: "Api Key",
                    supportQR: true
                },
                {
                    key: PermissionKeys.API_SECRET,
                    keyTitle: "Api Secret",
                    supportQR: true
                }]
        },




        {
            name: "Binance",
            keyName: "binance",
            logoUrl: "https://www.cryptocompare.com/media/9350818/binance.png",
            instructions: ["1. Log in to your Binance account and go to Account -> API Management\n", 
            "2. Give a label to your api key\n",
            "3. Select only the 'Can Read' option.\n",
            "4. Scan the QR Code or enter the api key and api secret manualy\n"],

            permissionKeys: [ 
                {
                    key: PermissionKeys.API_KEY,
                    keyTitle: "Api Key",
                    supportQR: true
                },
                {
                    key: PermissionKeys.API_SECRET,
                    keyTitle: "Api Secret",
                    supportQR: true
                }]
        }
        
    ] 
}


module.exports = {
    exchanges,
    PermissionKeys,
}