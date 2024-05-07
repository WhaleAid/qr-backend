const OpenAI = require('openai');
const { Generation } = require('../models');

exports.generateCompletion = async (req, res) => {

    const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { panelId } = req.params;
    const { prompt } = req.body;

    try {
        const completion = await openAI.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are simply a catchphrase generator, you'll be told what product to talk about and you generate a simple but catchy catchphrase in 1 or 2 sentences```The phrase you generate must be in french```."
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });
        const generation = await Generation.create({ text: completion.choices[0].message.content.replace(/['"]+/g, ''), panelId: panelId })
        res.status(200).json({ phrase: completion.choices[0].message.content, generationId: generation._id });
        // res.status(200).json("Hello World");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.generateColors = async (req, res) => {

    const { generationId } = req.params;

    const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { prompt, colors } = req.body;

    try {
        const generation = await Generation.findById(generationId);
        if (!generation) {
            return res.status(404).send("Generation not found");
        }
        const completion = await openAI.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a color palette generator, your job is to generate 5 color hex codes derived of these colors :" + colors + " and return them in an array format." +
                        "you must generate the colors strictly under this format :" +
                        "[color1, color2, color3, color4, color5]" +
                        "color1 is a text color which will be applied to a text displayed on top of a gradient of color2, color3, color4 and color5 so you need to make sure the contrast is right so the text is readable" +
                        "``` Do not use the same color twice in the array```" +
                        "``` Do not stick to one shade```" +
                        "```Do not write any comments stick to the format i mentionned```"
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        generation.colors = JSON.parse(completion.choices[0].message.content);
        generation.save();
        res.status(200).json(completion.choices[0].message.content);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}