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
        },
        


        // {
        //     name: "CEX.IO",
        //     keyName: "cex_io",
        //     logoUrl: "https://www.cryptocompare.com/media/19565/cexio.png",
        //     instructions: ["1. Log in to your CEX.IO account and go to Account -> Profile\n", 
        //     "2. Choose the api tab\n",
        //     "3. Select only the 'Account Balance' permission and click on 'Generate Key'.\n",
        //     "4. Save the User Id, Key and Secret and click on Activate\n",
        //     "5. Enter you User Id, Key and Secret here\n"],

        //     permissionKeys: [ 
        //         {
        //             key: PermissionKeys.API_KEY,
        //             keyTitle: "Api Key",
        //             supportQR: false
        //         },
        //         {
        //             key: PermissionKeys.API_SECRET,
        //             keyTitle: "Api Secret",
        //             supportQR: false
        //         },
        //         {
        //             key: PermissionKeys.USER_ID,
        //             keyTitle: "User ID",
        //             supportQR: false
        //         }]
        // },


        {
            name: "KuCoin",
            keyName: "kucoin",
            logoUrl: "https://www.cryptocompare.com/media/16746542/kucoin-exchange.png",
            instructions: ["1. Log in to your KuCoin account and go to Account -> Api Management\n", 
            "2. Click on Create Api\n",
            "3. Enter Api Name and Api Passphrase. Save the passphrase, you will need it later.\n",
            "4. For verification purpose you will need to enter you trading password and make an sms verification.\n",
            "5. Enter here the Key, Secret, and Passphrase. scanning the QR from KuCoin only gives the secret key.\n"],

            permissionKeys: [ 
                {
                    key: PermissionKeys.API_KEY,
                    keyTitle: "Api Key",
                    supportQR: false
                },
                {
                    key: PermissionKeys.API_SECRET,
                    keyTitle: "Api Secret",
                    supportQR: true
                },
                {
                    key: PermissionKeys.USER_ID,
                    keyTitle: "Passphrase",
                    supportQR: false
                }]
        }

    ] 
}


module.exports = {
    exchanges,
    PermissionKeys,
}