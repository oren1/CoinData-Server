const CryptoJS = require('crypto-js')
const SECRET_KEY_CD = process.env.SECRET_KEY_CD

const encryptData = (params) => {
    const output = CryptoJS.AES.encrypt(JSON.stringify(params), SECRET_KEY_CD).toString()
    return output
}

const decryptCipher = (ciphertext) => {

    var bytes  = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY_CD)
    var decryptedParams = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    const bytes = CryptoJS.AES.decrypt(params, SECRET_KEY_CD)
    return bytes.toString(CryptoJS.enc.Utf8)
}

module.exports = () => {
    if (!SECRET_KEYB || !SECRET_KEYB.length) {
        throw new Error("pleae see env")
    }

    return {
        encryptData,
        decryptCipher
    } 
}