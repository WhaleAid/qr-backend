const { requireAdmin } = require("../middlewares/requireAdmin.js");
const { requireUser } = require("../middlewares/requireUser.js");

module.exports = (app) => {
    const aiController = require("../controllers/ai.controller.js");

    app.post("/ai/campaign/:campaignId/generate-completion", aiController.generateCompletion);
    app.post("/ai/campaign/:campaignId/generate-images", requireAdmin, aiController.generateImages);
    app.post("/generate-colors/:generationId", aiController.generateColors);
}