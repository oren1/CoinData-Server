const PermissionKeys = {
    API_KEY: 'apiKey',
    API_SECRET: 'apiSecret',
    USER_ID: 'userId',
}

const exchanges = {
    bitfinex: {
        name: "bitfinex",
        logoUrl: "https://www.cryptocompare.com/media/37071996/bitfinex.png",
        instructions: ["string1", "string2","string3","string4"],
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
}


module.exports = {
    exchanges,
    PermissionKeys,
}