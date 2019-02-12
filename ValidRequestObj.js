
class ValidRequestObj {
    constructor(registerStar,walletAddress,requestTimeStamp,message,validationWindow,valid){
        this.registerStar = registerStar;
        this.status = {
            address: walletAddress,
            requestTimeStamp: requestTimeStamp,
            message: message,
            validationWindow: validationWindow,
            messageSignature: valid
         };
    }
}

module.exports.ValidRequestObj = ValidRequestObj;