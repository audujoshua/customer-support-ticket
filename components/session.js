const appConst = require ('./constants');
const sessions = require('../models/sessions.js');



//////////// Session middleware to validate that a request comes with a valid session  //////////////

function hasSession(req, res, next){
    checkHeader(req, (userSessionData) => {
        if(userSessionData != false){
            req.app.locals.userId = userSessionData.user_id;
            next();
        }else next('login-required')
    })
}

/////////////////////////////////////

// Check if the header sent is valid
function checkHeader(req, callBack){
    let cookie  = req.header(appConst.SESSION_HEADER);    
    if (cookie) {
        sessions.findOne({_id: cookie}, (err, userSession) => {
            if (!err && userSession) {

                // Ensure that the session has not expired.
                let currentTime = new Date();
                currentTime = currentTime.getTime();

                let sessionTime = new Date(userSession['last_entry']);
                sessionTime = sessionTime.getTime();

                if ((currentTime - sessionTime) < appConst.SESSION_IDLE_LIMIT) {
                    updateSession(cookie, (res) => {                        
                        if (res) callBack(userSession);                        
                        else callBack(false);
                    });                    
                } else { 
                    ClearUserSession(cookie, () => {});
                    callBack(false);
                }
            } else {
                if(err) log(err);
                callBack(false);
            }
        })
    } else callBack(false);
}

// Reset the last date the service was accessed using the attached header
function updateSession(sessionId, callBack){
    let dt = new Date();
    let mth = ((dt.getMonth() + 1) < 10 ? '0' : '') + (dt.getMonth() + 1);
    dt = dt.getFullYear() + '-' + mth + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();            

    sessions.update({_id: sessionId}, {$set: {last_entry: dt}}, (err, result) => {
        if (!err) {
            callBack(true);
        } else callBack(false);
    })
}

// Create a new session for user
function createSession(userId, callBack){

    let newSession = new sessions({
        user_id: userId
    });
    newSession.save((err, res) => {
        if (!err) callBack(res._id)
        else {
            log(err);
            callBack(false);
        }
    });
}

// Delete the user session
function ClearUserSession(sessionId, callBack){
    sessions.remove({_id: sessionId}, (err) => {
        if(!err) callBack(true);
        else {
            log(err);
            callBack(false);
        }
    })
}

module.exports.hasSession = hasSession;
module.exports.checkHeader = checkHeader;
module.exports.createSession = createSession;