const { Generation } = require('../models');

exports.generations = async (req, res) => {
    const { text, colors } = req.body;

    try {
        const createdGeneration = await Generation.create({ text, colors });
        res.status(201).json(createdGeneration);
    } catch (error) {
        console.error("Error creating generation:", error);
        res.status(500).send("Error creating generation");
    }
}

exports.voteGeneration = async (req, res) => {
    const { generationId } = req.params;
    const { vote } = req.body

    try {
        const generation = await Generation.findById(generationId);
        if (!generation) {
            return res.status(404).send("Generation not found");
        }
        if (!vote || (vote !== "true" && vote !== "false")) {
            return res.status(400).send("Invalid vote");
        }

        generation.valid = vote;
        await generation.save();

        res.status(200).send("Generation validated");
    } catch (error) {
        console.error("Error validating generation:", error);
        res.status(500).send("Error validating generation");
    }
}

exports.updateVote = async (req, res) => {
    const { generationId } = req.params;
    const { vote } = req.body

    try {
        const generation = await Generation.findById(generationId);
        if (!generation) {
            return res.status(404).send("Generation not found");
        }
        if (!vote || (vote !== "true" && vote !== "false")) {
            return res.status(400).send("Invalid vote");
        }

        generation.vote = vote;
        await generation.save();

        res.status(200).send("Vote updated");
    } catch (error) {
        console.error("Error updating vote:", error);
        res.status(500).send("Error updating vote");
    }
}

exports.getGenerations = async (req, res) => {
    try {
        const generations = await Generation.find({ isModerated: true })
            .sort({ createdAt: -1 })
        if (!generations) {
            return res.status(404).send("Generations not found");
        }

        res.status(200).json(generations);
    } catch (error) {
        console.error("Error getting generations:", error);
        res.status(500).send("Error getting generations");
    }
}

//? This function may not be used
exports.deleteGeneration = async (req, res) => {
    const { generationId } = req.params;

    try {
        const generation = await Generation.findById(generationId);
        if (!generation) {
            return res.status(404).send("Generation not found");
        }

        await generation.remove();
        res.status(200).send("Generation deleted");
    } catch (error) {
        console.error("Error deleting generation:", error);
        res.status(500).send("Error deleting generation");
    }
}

