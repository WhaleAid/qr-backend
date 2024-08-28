const { requireUser } = require("../middlewares/requireUser.js");

module.exports = app => {
    const auth = require("../controllers/auth.controller.js");

    app.post('/auth/login', auth.login);
    app.post('/auth/register', auth.register);
    app.post('/auth/validate-token', auth.validateToken);
}