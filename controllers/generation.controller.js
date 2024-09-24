const mongoose = require('mongoose');
const { Generation, Campaign, Image } = require('../models');
// const { sendRegisterEmail } = require('../utils/email.utils');

exports.moderateGeneration = async (req, res) => {
    const { generationId } = req.params;
    const { approved } = req.body;

    try {
        const generation = await Generation.findById(generationId);

        if (!generation) {
            return res.status(404).json("Content not found");
        }
        // await sendRegisterEmail({
        //     email: 'khalqallahwalid@gmail.com',
        //     hash: 'hash'
        // })
        generation.isModerated = approved;
        await generation.save();
        res.status(200).json("Géneration modérée");
    } catch (error) {
        console.error("Error moderating content:", error);
        res.status(500).json("Erreur lors de la modération de la géneration");
    }
}

exports.voteGeneration = async (req, res) => {
    const { generationId } = req.params;
    const { vote } = req.body

    try {
        const generation = await Generation.findById(generationId);
        if (!generation) {
            return res.status(404).json("Génération non trouvée");
        }

        if (vote !== true && vote !== false) {
            return res.status(400).json("Invalid vote");
        }

        generation.valid = vote;
        await generation.save();

        res.status(200).json("Génération validated");
    } catch (error) {
        console.error("Error validating generation:", error);
        res.status(500).json("Erreur lors de la validation de la génération");
    }
}

exports.removeVote = async (req, res) => {
    const { generationId } = req.params;

    try {
        const generation = await Generation.findById(generationId);

        if (!generation) {
            return res.status(404).json("Génération non trouvée");
        }

        generation.valid = null;
        await generation.save();

        res.status(200).json("Vote removed");
    } catch (error) {
        console.error("Error removing vote:", error);
        res.status(500).json("Erreur lors de la suppression du vote");
    }
}

exports.getAll = async (req, res) => {
    try {
        const generations = await Generation.find().populate({
            path: 'campaign',
            populate: {
                path: 'owner'
            }
        })
            .sort({ createdAt: -1 })
        if (!generations) {
            return res.status(404).json("Générations non trouvées");
        }

        res.status(200).json(generations);
    } catch (error) {
        res.status(500).json("Erreur lors de la récupération des générations");
    }
}

exports.getAllNotVotedByCampaign = async (req, res) => {
    const { campaignId } = req.params;

    try {
        const generations = await Generation.find({
            campaign: campaignId,
            isModerated: true,
            $or: [
                { valid: { $exists: false } },
                { valid: null }
            ]
        }).populate('campaign')
            .sort({ createdAt: -1 });
        if (!generations) {
            return res.status(404).json("Générations non trouvées");
        }

        res.status(200).json(generations);
    } catch (error) {
        res.status(500).json("Erreur lors de la récupération des générations");
    }
}

exports.getMyGenerations = async (req, res) => {
    const { id } = req.user;
    try {
        const generations = await Generation.find()
            .populate({
                path: 'campaign',
                populate: { path: 'owner' }
            })
            .sort({ createdAt: -1 });
        if (!generations) {
            return res.status(404).json("Générations non trouvées");
        }
        const filteredGenerations = generations.filter(generation => generation.campaign.owner._id == id)
        console.log("🚀 ~ exports.getMyGenerations= ~ filteredGenerations:", filteredGenerations)

        res.status(200).json(filteredGenerations);
    } catch (error) {
        console.log(error);
        res.status(500).json("Erreur lors de la récupération des générations");
    }
}

exports.getMyGenerationHistory = async (req, res) => {
    const { id } = req.user;
    try {
        const generations = await Generation.find({
            valid: {
                $in: [true, false]
            }
        })
            .populate({
                path: 'campaign',
                populate: { path: 'owner' }
            })
            .sort({ createdAt: -1 });

        if (!generations) {
            return res.status(404).json("Contenu non trouvées");
        }
        const filteredGenerations = generations.filter(generation => generation.campaign.owner._id == id)

        res.status(200).json(filteredGenerations);
    } catch (error) {
        console.log(error);
        res.status(500).json("Erreur lors de la récupération des générations");
    }
}

exports.getAllByCampaignModerated = async (req, res) => {
    const { campaignId } = req.params;

    try {
        const generations = await Generation.find({ campaign: campaignId, isModerated: true }).populate('campaign')
            .sort({ createdAt: -1 });
        if (!generations) {
            return res.status(404).json("Générations non trouvées");
        }

        res.status(200).json(generations);
    } catch (error) {
        res.status(500).json("Erreur lors de la récupération des générations");
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
                    foreignField: "generation",
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
                    generation: { $first: "$$ROOT" },
                    scanCount: { $sum: { $cond: [{ $ifNull: ["$scanDetails", false] }, 1, 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    _id: "$generation._id",
                    text: "$generation.text",
                    isModerated: "$generation.isModerated",
                    campaign: "$generation.campaignDetails",
                    createdAt: "$generation.createdAt",
                    updatedAt: "$generation.updatedAt",
                    valid: "$generation.valid",
                    scanCount: 1
                }
            }
        ]
        const generations = await Generation.aggregate(aggregateOptions);
        if (!generations) {
            return res.status(404).json("Générations non trouvées");
        }
        res.status(200).json(generations);
    } catch (error) {
        console.log(error);
        res.status(500).json("Erreur lors de la récupération des générations");
    }
}

//! This function may not be used

exports.deleteOne = async (req, res) => {
    const { generationId } = req.params;

    try {
        const generation = await Generation.findById(generationId);
        if (!generation) {
            return res.status(404).json("Génération non trouvée");
        }

        await generation.remove();
        res.status(200).json("Génération supprimée");
    } catch (error) {
        res.status(500).json("Erreur lors de la suppression de la génération");
    }
}

exports.getRandomGenerationAndImageByCampaign = async (req, res) => {
    const { campaignId } = req.params;

    try {
        const generationAggregation = [
            {
                $match: {
                    campaign: new mongoose.Types.ObjectId(campaignId),
                    text: { $exists: true },
                    isModerated: true,
                    valid: true
                    // TODO: Add check for moderation and validation
                }
            },
            { $sample: { size: 1 } }
        ];

        const imageAggregation = [
            {
                $match: {
                    campaign: new mongoose.Types.ObjectId(campaignId),
                    image: { $exists: true },
                    isModerated: true,
                    valid: true
                    // TODO: Add check for moderation and validation
                }
            },
            { $sample: { size: 1 } }
        ];

        const [generation] = await Generation.aggregate(generationAggregation);
        const [image] = await Image.aggregate(imageAggregation);
        const generationId = generation?._id;
        const imageId = image?._id;

        res.status(200).json({ generationid:generationId, imageid:imageId, text: generation?.text, image: image?.image });
    } catch (error) {
        console.log(error);
        res.status(500).json("Erreur lors de la récupération de la génération");
    }
};

