const { requireAdmin } = require("../middlewares/requireAdmin.js");
const { requireUser } = require("../middlewares/requireUser.js");

module.exports = (app) => {
    const image = require("../controllers/image.controller.js");

    app.patch("/image/:imageId/moderate", requireAdmin, image.moderateImage);
    app.get("/image", requireAdmin, image.getAll);
    app.post("/image/:imageId/vote", requireUser, image.voteImage);
    app.patch("/image/:imageId/remove-vote", requireUser, image.removeVote);
    app.get("/image/my-images", requireUser, image.getMyImages);
    app.get("/image/campaign/:campaignId/not-voted", requireUser, image.getAllNotVotedByCampaign);
    app.get("/image/campaign/:campaignId/moderated", requireUser, image.getAllModeratedByCampaign);
    app.get("/image/campaign/:campaignId", requireAdmin, image.getAllByCampaign);
    app.get("/image/my-history", requireUser, image.getMyImageHistory);
}