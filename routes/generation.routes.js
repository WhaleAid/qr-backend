const { requireUser } = require("../middlewares/requireUser.js");

mondule.exports = (app) => {
    const generation = require("../controllers/generation.controller.js");

    app.post("/generation", requireUser, generation.create);
}