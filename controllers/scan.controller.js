const { Scan, Generation } = require("../models");
const { IPinfoWrapper } = require('node-ipinfo');

const ipinfo = new IPinfoWrapper(process.env.IPINFO_API_TOKEN);

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
                city: response.city,
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