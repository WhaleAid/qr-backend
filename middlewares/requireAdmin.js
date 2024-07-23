const { User } = require('../models')

exports.requireAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(403).json("Not logged in")
        }
        if (user.role !== 'admin' && req.user.role !== 'admin') {
            return res.status(401).json("Unauthorized")
        }
    } catch (error) {
        console.error("Error requiring admin:", error)
        return res.status(500).json("Error requiring admin")
    }

    return next();
}