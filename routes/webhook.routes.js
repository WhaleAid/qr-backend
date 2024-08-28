const cors = require('cors');

module.exports = (app) => {
    const webhook = require("../controllers/webhook.controller.js");

    app.post("/webhook/midjourney", webhook.midjourneyWebhook, cors({
        origin: '*',
        credentials: false
    }));
    app.post("/trigger-webhook", webhook.triggerWebhook);
}