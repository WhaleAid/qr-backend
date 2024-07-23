const mongoose = require('mongoose');
//! create image generations with midjourney and send the webhook address then midjourney will make a call to the webhook controller thingy

const { Image } = require("../models");

exports.moderateImage = async (req, res) => {
    const { imageId } = req.params;
    const { approved } = req.body;

    try {
        const image = await Image.findById(imageId);
        if (!image) {
            return res.status(404).json("Image not found");
        }

        image.isModerated = approved;
        await image.save();
        res.status(200).json("Image moderated");
    } catch (error) {
        console.error("Error moderating image:", error);
        res.status(500).json("Error moderating image");
    }
}

exports.getAll = async (req, res) => {
    try {
        const images = await Image.find().populate({
            path: 'campaign',
            populate: {
                path: 'owner'
            }
        })
            .sort({ createdAt: -1 })
        if (!images) {
            return res.status(404).json("Images non trouvées");
        }

        res.status(200).json(images);
    } catch (error) {
        res.status(500).json("Erreur lors de la récupération des images");
    }
}

exports.voteImage = async (req, res) => {
    const { imageId } = req.params;
    const { vote } = req.body

    try {
        const image = await Image.findById(imageId);

        if (!image) {
            return res.status(404).json("Image not found");
        }

        if (vote !== true && vote !== false) {
            return res.status(400).json("Invalid vote");
        }

        image.valid = vote;
        await image.save();

        res.status(200).json("Image validated");
    } catch (error) {
        console.error("Error validating image:", error);
        res.status(500).json("Error validating image");
    }
}

exports.removeVote = async (req, res) => {
    const { imageId } = req.params;

    try {
        const image = await Image.findById(imageId);

        if (!image) {
            return res.status(404).json("Image not found");
        }

        image.valid = null;
        await image.save();

        res.status(200).json("Vote removed");
    } catch (error) {
        console.error("Error removing vote:", error);
        res.status(500).json("Error removing vote");
    }
}

exports.getMyImages = async (req, res) => {
    const { id } = req.user;
    try {
        let content;
        const images = await Image.find()
            .populate({
                path: 'campaign',
                populate: { path: 'owner' }
            })
            .sort({ createdAt: -1 });
        if (!images) {
            return res.status(404).json("Images non trouvées");
        }
        const filteredImages = images.filter(image => image.campaign.owner._id == id)
        console.log("🚀 ~ exports.getMyImages= ~ filteredImages:", filteredImages)

        res.status(200).json(filteredImages);
    } catch (error) {
        console.log(error);
        res.status(500).json("Erreur lors de la récupération des images");
    }
}

exports.getAllNotVotedByCampaign = async (req, res) => {
    const { campaignId } = req.params;

    try {
        const images = await Image.find({
            campaign: campaignId,
            isModerated: true,
            $or: [
                { valid: { $exists: false } },
                { valid: null }
            ]
        }).populate('campaign')
            .sort({ createdAt: -1 });
        if (!images) {
            return res.status(404).json("Images non trouvées");
        }

        res.status(200).json(images);
    } catch (error) {
        res.status(500).json("Erreur lors de la récupération des images");
    }
}

exports.getAllModeratedByCampaign = async (req, res) => {
    const { campaignId } = req.params;

    try {
        const images = await Image.find({ campaign: campaignId, isModerated: true }).populate('campaign')
            .sort({ createdAt: -1 });
        if (!images) {
            return res.status(404).json("Images non trouvées");
        }

        res.status(200).json(images);
    } catch (error) {
        res.status(500).json("Erreur lors de la récupération des images");
    }
}

exports.getMyImageHistory = async (req, res) => {
    const { id } = req.user;
    try {
        const images = await Image.find({
            valid: {
                $in: [true, false]
            }
        })
            .populate({
                path: 'campaign',
                populate: { path: 'owner' }
            })
            .sort({ createdAt: -1 });

        if (!images) {
            return res.status(404).json("Contenu non trouvées");
        }
        const filteredImages = images.filter(image => image.campaign.owner._id == id)
        res.status(200).json(filteredImages);

    } catch (error) {
        console.log(error);
        res.status(500).json("Erreur lors de la récupération des images");
    }
}

exports.getAllByCampaign = async (req, res) => {
    const { campaignId } = req.params;

    try {
        const aggregateOptions = [
            {
                $match: {
                    campaign: new mongoose.Types.ObjectId(campaignId)
                }
            },
            {
                $lookup: {
                    from: "campaigns",
                    localField: "campaign",
                    foreignField: "_id",
                    as: "campaignDetails"
                }
            },
            {
                $unwind: {
                    path: "$campaignDetails",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup: {
                    from: "scans",
                    localField: "_id",
                    foreignField: "image",
                    as: "scanDetails"
                }
            },
            {
                $unwind: {
                    path: "$scanDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$_id",
                    image: { $first: "$$ROOT" },
                    scanCount: { $sum: { $cond: [{ $ifNull: ["$scanDetails", false] }, 1, 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    _id: "$image._id",
                    image: "$image.image",
                    hash: "$image.hash",
                    progress: "$image.progress",
                    status: "$image.status",
                    status_reason: "$image.status_reason",
                    isModerated: "$image.isModerated",
                    campaign: "$image.campaignDetails",
                    createdAt: "$image.createdAt",
                    updatedAt: "$image.updatedAt",
                    valid: "$image.valid",
                    scanCount: 1
                }
            }
        ]
        const images = await Image.aggregate(aggregateOptions);
        if (!images) {
            return res.status(404).json("Images non trouvées");
        }
        res.status(200).json(images);
    } catch (error) {
        console.log(error);
        res.status(500).json("Erreur lors de la récupération des images");
    }
}