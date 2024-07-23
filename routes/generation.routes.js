const { requireAdmin } = require("../middlewares/requireAdmin.js");
const { requireUser } = require("../middlewares/requireUser.js");

module.exports = (app) => {
    const generation = require("../controllers/generation.controller.js");

    // app.post("/generation", requireUser, generation.create);
    app.get("/generation", requireAdmin, generation.getAll);
    app.delete("/generation/:generationId", requireUser, generation.deleteOne);
    app.post("/generation/:generationId/vote", requireUser, generation.voteGeneration)
    app.patch("/generation/:genrationId/remove-vote", requireUser, generation.removeVote)
    app.patch("/generation/:generationId/moderate", requireUser, generation.moderateGeneration)
    app.get("/generation/campaign/:campaignId", requireAdmin, generation.getAllByCampaign)
    app.get("/generation/campaign/:campaignId/moderated", requireUser, generation.getAllByCampaignModerated)
    app.get("/generation/campaign/:campaignId/not-voted", requireUser, generation.getAllNotVotedByCampaign)
    app.get("/generation/my-generations", requireUser, generation.getMyGenerations)
    app.get("/generation/my-history", requireUser, generation.getMyGenerationHistory)
    app.get("/generation/:campaignId", generation.getRandomGenerationAndImageByCampaign)
}