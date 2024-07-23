const { requireAdmin } = require('../middlewares/requireAdmin.js');
const { requireUser } = require('../middlewares/requireUser')

module.exports = app => {
    const user = require("../controllers/user.controller.js");

    app.get('/me', requireUser, user.getMe)
    app.patch('/me/update', requireUser, user.updateMe)
    app.patch('/me/reset-password', requireUser, user.SendResetPasswordEmail)
    app.post('/me/update-password', requireUser, user.updatePassword)
    app.get('/users', requireAdmin, user.getAll)
}