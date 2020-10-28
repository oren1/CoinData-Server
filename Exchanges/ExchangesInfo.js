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
            instructions: ["1. string1\n", "2. string2\n","3. string3\n","4. string4\n"],
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