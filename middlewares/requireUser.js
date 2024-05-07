exports.requireUser = (req, res, next) => {
    if(!req.user) {
        return res.status(403).send("Not logged in")
    }

    return next();
}