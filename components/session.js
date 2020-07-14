const appConst = require ('./constants');
const jwt = require('./jwt');


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
    let hdr  = req.header(appConst.SESSION_HEADER);    
    if (hdr) {
        if (jwt.verify(hdr)) {
            let d = jwt.decode(hdr);
            callBack({
                user_id: d.payload.user_id
            })
        } else callBack(false);
    } else callBack(false);
}


// Create a new session for user
function createSession(userId, callBack){
    callBack(jwt.sign({user_id: userId}));
}


module.exports.hasSession = hasSession;
module.exports.checkHeader = checkHeader;
module.exports.createSession = createSession;