const { requireAdmin } = require("../middlewares/requireAdmin.js");
const { requireUser } = require("../middlewares/requireUser.js");

module.exports = (app) => {
    const campaign = require("../controllers/campaign.controller.js");

    app.post("/campaign", requireAdmin, campaign.create);
    app.get("/campaign", requireUser, campaign.findAll);
    app.get("/campaign/:campaignId", requireAdmin, campaign.findOne);
    app.put("/campaign/:campaignId", requireUser, campaign.update);
    app.delete("/campaign/:campaignId", requireUser, campaign.delete);
    app.get("/campaign/user/:userId", requireAdmin, campaign.getCampaignsByUser);
}