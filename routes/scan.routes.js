const { requireAdmin } = require("../middlewares/requireAdmin.js");
const { requireUser } = require("../middlewares/requireUser.js");

module.exports = (app) => {
    const scan = require("../controllers/scan.controller.js");

    app.get("/scan/campaign/:campaignId", requireAdmin, scan.getScansByCampaign);
    app.get("/scan/:generationId/:imageId", scan.scan);
}