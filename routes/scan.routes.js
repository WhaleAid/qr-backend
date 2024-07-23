const { requireUser } = require("../middlewares/requireUser.js");

module.exports = (app) => {
    const scan = require("../controllers/scan.controller.js");

    app.get("/scan/:generationId", scan.scan);
}