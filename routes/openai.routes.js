const { requireUser } = require("../middlewares/requireUser.js");

module.exports = (app) => {
    const openai = require("../controllers/openai.controller.js");

    app.post("/generate-completion", requireUser, openai.generateCompletion);
    app.post("/generate-colors/:generationId", requireUser, openai.generateColors);
}