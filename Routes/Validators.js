const { NotificationType, NotificationDirection } = require("../Models/Notification")

const validateDirectionValue = (value, { req }) => {
       
    if(req.params.notificationType == NotificationType.LIMIT_NOTIFICATION){
            if (value == NotificationDirection.BIGGER_THAN || 
                value == NotificationDirection.SMALLER_THAN) {
                    return true;
            }
            throw new Error('wrong "direction" value');
     }
    
    return true 
}


const validateNotificationTypeValue = (value, {req}) => {
    
    if (value == NotificationType.LIMIT_NOTIFICATION ||
        value == NotificationType.INTERVAL_NOTIFICATION) {
            return true
        }
    else throw new Error("wrong 'notificationType' value")
}


module.exports = {
    validateDirectionValue,
    validateNotificationTypeValue,
}