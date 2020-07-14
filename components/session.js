const appConst = require ('./constants');
const jwt = require('./jwt');


//////////// Session middleware to validate that a request comes with a valid session  //////////////

// For users
function hasUserSession(req, res, next){
    checkHeader(req, (userSessionData) => {
        if(userSessionData != false && userSessionData.role === "user"){
            req.app.locals.userId = userSessionData.user_id;
            next();
        }else next('login-required')
    })
}

// For Agents
function hasAgentSession(req, res, next){
    checkHeader(req, (userSessionData) => {
        if(userSessionData != false && userSessionData.role === "agent"){
            req.app.locals.userId = userSessionData.user_id;
            next();
        }else next('login-required')
    })
}

// For Admin
function hasAdminSession(req, res, next){
    checkHeader(req, (userSessionData) => {
        if(userSessionData != false && userSessionData.role === "user"){
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
                user_id: d.payload.user_id,
                role: d.payload.role
            })
        } else callBack(false);
    } else callBack(false);
}


// Create a new session for user
function createSession(userId, role, callBack){
    callBack(jwt.sign({user_id: userId, role}));
}


module.exports.hasUserSession = hasUserSession;
module.exports.hasAgentSession = hasAgentSession;
module.exports.hasAdminSession = hasAdminSession;
module.exports.checkHeader = checkHeader;
module.exports.createSession = createSession;