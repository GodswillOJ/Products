const flasherMiddleware = (req, res, next) => {
    if (req.session.flashData) {
        for(const key in req.session.flashData) {
            res.locals[key] = req.session.flashData[key]
        }
        req.session.flashData = null
    }
    next()
} 
module.exports = flasherMiddleware

// This is used to give a one time flash msg, and redirect bck to page by a Get method.