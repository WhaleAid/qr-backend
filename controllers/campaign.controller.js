const { Generation, Campaign } = require('../models');

exports.findAll = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ owner: req.user.id });
        if (!campaigns) {
            return res.status(404).json("Campagnes introuvables");
        }
        res.status(200).json(campaigns);
    } catch (error) {
        console.error("Erreur lors de la récupération des campagnes:", error);
        res.status(500).json("Erreur lors de la récupération des campagnes");
    }
}

exports.findOne = async (req, res) => {
    const { campaignId } = req.params;
    try {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json("Campagne introuvable");
        }
        res.status(200).json(campaign);
    } catch (error) {
        console.error("Erreur lors de la récupération de la campagne:", error);
        res.status(500).json("Erreur lors de la récupération de la campagne");
    }
}

exports.create = async (req, res) => {

    try {
        const { name, description, clientId } = req.body;
        if (!name || !description || !clientId) {
            return res.status(400).json("Informations manquantes");
        }

        if (req.user.role !== 'admin' && req.user.id !== clientId) {
            return res.status(401).json("Non autorisé");
        }

        const campaign = await Campaign.create({ name, description, owner: clientId });
        res.status(201).json(campaign);
    } catch (error) {
        console.error("Erreur lors de la création de la campagne:", error);
        res.status(500).json("Erreur lors de la création de la campagne");
    }
}

exports.update = async (req, res) => {
    const { id } = req.params;
    try {
        const campaign = await Campaign.findOne({ _id: id, owner: req.user.id });
        if (!campaign) {
            return res.status(404).json("Campagne introuvable");
        }

        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json("Nom ou description manquant");
        }

        campaign.name = name;
        campaign.description = description;
        await campaign.save();

        res.status(200).json("Campagne mise à jour");
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la campagne:", error);
        res.status(500).json("Erreur lors de la mise à jour de la campagne");
    }
}

exports.getCampaignsByUser = async (req, res) => {
    const { userId } = req.params
    try {
        const campaigns = await Campaign.find({ owner: userId }).populate('owner')
        if (!campaigns) {
            return res.status(404).json("Campagnes introuvables");
        }
        res.status(200).json(campaigns);
    } catch (error) {
        console.error("Erreur lors de la récupération des campagnes:", error);
        res.status(500).json("Erreur lors de la récupération des campagnes");
    }
}

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await Campaign.findOne({ _id: id, owner: req.user.id });
        if (!campaign) {
            return res.status(404).json("Campagne introuvable");
        }

        await Generation.deleteMany({ campaign: id });
        await Campaign.deleteOne({ _id: id });
        res.status(200).json("Campagne supprimée");
    } catch (error) {
        console.error("Erreur lors de la suppression de la campagne:", error);
        res.status(500).json("Erreur lors de la suppression de la campagne");
    }
}