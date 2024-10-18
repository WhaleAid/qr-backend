const OpenAI = require('openai');
const { Generation, Image } = require('../models');
const axios = require('axios');

exports.generateCompletion = async (req, res) => {

    const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { campaignId } = req.params;
    const { prompt } = req.body;

    try {
        const completion = await openAI.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "Nous lançons des campagnes publicitaires DOOH sur nos écrans. Nous avons besoin d'avoir un record de scan QR Code pour le client. Vous êtes un growth hacker et copywriter, et vous êtes capable de créer des phrases d'accroches qu'on appelle Call To Action qui permettent de fortement pousser les gens à l'action, c'est-à-dire que les passants scannent le QR Code présent dans nos écrans publicitaires Turnadon. Vous générez un tableau de 30 phrases courtes et accrocheuses en 1 ou 2 phrases. Les phrases que vous générez doivent être en français. La réponse doit être sous format d'un tableau avec les slogans générés. Voici le format de la réponse attendue : [\"slogan1\", \"slogan2\", \"slogan3\"] ainsi de suite. Ne rajoutez strictement rien à la réponse à part le tableau JS, je dois être capable de parser la réponse directement."
                },                
                {
                    role: "user",
                    content: prompt
                }
            ]
        });
        let phrases = JSON.parse(completion.choices[0].message.content);

        phrases.map(async (phrase) => {
            await Generation.create({ text: phrase, campaign: campaignId })
        })
        res.status(200).json(completion.text);
    } catch (error) {
        console.log("🚀 ~ exports.generateCompletion ~ error:", error)
        res.status(500).json({ error: "Erreur lors de la création de votre contenu" })
    }
}

exports.generateColors = async (req, res) => {

    // const { generationId } = req.params;

    // const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const { prompt, colors } = req.body;

    try {
        // const generation = await Generation.findById(generationId);
        // if (!generation) {
        //     return res.status(404).json("Génération non trouvée");
        // }
        // const completion = await openAI.chat.completions.create({
        //     model: "gpt-3.5-turbo",
        //     messages: [
        //         {
        //             role: "system",
        //             content: "You are a color palette generator, your job is to generate 5 color hex codes derived of these colors :" + colors + " and return them in an array format." +
        //                 "you must generate the colors strictly under this format :" +
        //                 "[color1, color2, color3, color4, color5]" +
        //                 "color1 is a text color which will be applied to a text displayed on top of a gradient of color2, color3, color4 and color5 so you need to make sure the contrast is right so the text is readable" +
        //                 "``` Do not use the same color twice in the array```" +
        //                 "``` Do not stick to one shade```" +
        //                 "```Do not write any comments stick to the format i mentionned```"
        //         },
        //         {
        //             role: "user",
        //             content: prompt
        //         }
        //     ]
        // });

        // generation.colors = JSON.parse(completion.choices[0].message.content);
        // generation.save();

        res.status(200).json(completion.choices[0].message.content);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.generateImages = async (req, res) => {
    const { campaignId } = req.params;
    const { prompt } = req.body;

    const midjourneyRequest = await axios.post('https://api.userapi.ai/midjourney/v2/imagine', {
        "prompt": prompt,
        "webhook_url": `${process.env.BACKEND_URL}webhook/midjourney`,
        "webhook_type": "progress",
        "account_hash": process.env.DISCORD_ACCOUNT_HASH,
        "is_disable_prefilter": false,
    }, {
        headers: {
            "api-key": process.env.USERAPI_API_KEY
        }
    })
    console.log("🚀 ~ exports.generateImages= ~ `${process.env.BACKEND_URL}webhook/midjourney`:", `${process.env.BACKEND_URL}webhook/midjourney`)

    for (let i = 0; i < 4; i++) {
        await Image.create({ campaign: campaignId, hash: midjourneyRequest.data.hash })
    }

    res.status(200).json(midjourneyRequest.data);
}