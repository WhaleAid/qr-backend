const { Scan, Generation } = require("../models");
const { IPinfoWrapper } = require('node-ipinfo');

const ipinfo = new IPinfoWrapper(process.env.IPINFO_API_TOKEN);

exports.scan = async (req, res) => {
    const { generationId } = req.params;
    const { redirectUrl } = req.query;

    if (!generationId) {
        return res.status(400).send("No generation ID was provided");
    }

    try {
        const generation = await Generation.findById(generationId);

        if (!generation) {
            return res.status(404).send("Generation not found");
        }

        let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        clientIp = clientIp
        ipinfo.lookupIp(clientIp).then(async (response) => {
            await Scan.create({
                generation: generationId,
                city: response.city,
            });
            res.redirect(redirectUrl ?? process.env.DEFAULT_REDIRECT_URL);
        }).catch((error) => {
            console.log("error: ", error);
        });

    } catch (error) {
        console.error("Error handling scan:", error);
        res.status(500).send("Error adding scan");
    }
};