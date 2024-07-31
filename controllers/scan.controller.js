const { Scan, Generation, Image } = require("../models");
const mongoose = require('mongoose');
const { IPinfoWrapper } = require('node-ipinfo');

exports.scan = async (req, res) => {
    const { generationId, imageId } = req.params;
    const { redirectUrl } = req.query;

    if (!generationId) {
        return res.status(400).json("ID de génération manquant");
    }

    try {
        const generation = await Generation.findById(generationId);
        const image = await Image.findById(imageId);

        if (!generation || !image) {
            return res.status(404).json("Contenu non trouvée");
        }
        const previousScan = await Scan.findOne({ generation: generationId, image: imageId });
        if (!previousScan) {
            await Scan.create({
                generation: generationId,
                image: imageId,
            });
        } else {
            previousScan.count++;
            await previousScan.save();
        }
        res.redirect(redirectUrl ?? process.env.DEFAULT_REDIRECT_URL);
    } catch (error) {
        console.log("🚀 ~ exports.scan ~ error:", error);
        res.status(500).json("Erreur lors de la création du scan");
    }
};

exports.getScansByCampaign = async (req, res) => {
    const { campaignId } = req.params;

    try {
        const pipeline = [
            {
                $lookup: {
                    from: "generations",
                    localField: "generation",
                    foreignField: "_id",
                    as: "generation"
                }
            },
            {
                $lookup: {
                    from: "images",
                    localField: "image",
                    foreignField: "_id",
                    as: "image"
                }
            },
            {
                $unwind: {
                    path: "$generation",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $unwind: {
                    path: "$image",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $addFields: {
                    campaign: {
                        $toObjectId: "$generation.campaign"
                    }
                }
            },
            {
                $match: {
                    campaign: new mongoose.Types.ObjectId(campaignId)
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ]
        const scans = await Scan.aggregate(pipeline);
        if (!scans) {
            return res.status(404).json("Scans non trouvés");
        }
        res.status(200).json(scans);
    } catch (error) {
        console.log("🚀 ~ exports.getScansByCampaign ~ error", error)
        res.status(500).json("Erreur lors de la récupération des scans")
    }
}