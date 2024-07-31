const axios = require('axios');
const { Image } = require('../models');
const { Generation } = require('../models');
const { extractUUID } = require('../utils/uuid.utils');
const { emitSocket } = require('../sockets/socketEvents');

//! This is the call that the midjourney will make
exports.midjourneyWebhook = async (req, res, next) => {
    console.log(req.headers)
    console.log('Midjourney webhook called')
    const { status, result, progress, hash, status_reason, created_at } = req.body;

    try {
        const images = await Image.find({ hash: hash })
        if (!images) {
            return res.status(404).json("Images not found");
        }

        let imagesUpdated = []

        images.map(async (image, index) => {
            switch (status) {
                case "sent":
                    image.status = "sent"
                    break;
                case "waiting":
                    image.status = "waiting"
                    break;
                case "progress":
                    image.status = "progress"
                    break;
                case "done":
                    image.status = "done"
                    const imageUuid = extractUUID(result.url)
                    image.image = `${process.env.MIDJOURNEY_CDN_URL}/${imageUuid}/0_${index}.png`
                    break;
                case "error":
                    image.status = "error"
                    break;
                default:
                    break;
            }
            image.progress = progress
            image.status_reason = status_reason
            image.createdAt = created_at
            imagesUpdated.push(image)
            await image.save()
        })

        emitSocket('progress', imagesUpdated)

    } catch (error) {
        console.log("🚀 ~ exports.midjourneyWebhook ~ error", error)
    }
}

exports.triggerWebhook = async (req, res, next) => {
    const response = await axios.post('https://webhook-test.com/534bd77e6cb949f5b12fde887bf23289', req.body);
    res.status(200).json();
}