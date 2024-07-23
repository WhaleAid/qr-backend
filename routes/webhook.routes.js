module.exports = (app) => {
    const webhook = require("../controllers/webhook.controller.js");

    app.post("/webhook/midjourney", webhook.midjourneyWebhook);
    app.post("/trigger-webhook", webhook.triggerWebhook);
}