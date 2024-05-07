const { requireUser } = require("../middlewares/requireUser.js");

module.exports = app => {
    const auth = require("../controllers/auth.controller.js");

    app.post('/login', auth.login);
    app.post("/register", auth.register);
    app.post("/logout", requireUser, auth.logout);
}