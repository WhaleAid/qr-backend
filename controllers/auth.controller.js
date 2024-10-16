const { User, Campaign } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { createSession, invalidateSession } = require('../services')
const { SignJWT, VerifyJWT } = require('../utils/jwt.utils')
const { sendRegisterEmail } = require('../utils/email.utils')
const { base64encode, base64decode } = require('nodejs-base64');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json("Email ou mot de passe manquant");
    }

    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(404).json("Email ou mot de passe incorrect");
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(404).json("Email ou mot de passe incorrect");
        }

        const session = createSession(user.email);

        const accessToken = SignJWT({ sessionId: session.sessionId, email: user.email, role: user.role, id: user._id }, '30d');
        const refreshToken = SignJWT({ sessionId: session.sessionId }, '1y');

        res.status(200).json({
            accessToken,
            refreshToken,
            user: user
        });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json("Error logging in");
    }
};


exports.register = async (req, res) => {
    try {
        const { email, password, company } = req.body;
        if (!email || !password) {
            return res.status(400).json("Email ou mot de passe manquant");
        }
        if (!company) {
            return res.status(400).json("Renseignez le nom de votre entreprise");
        }

        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res.status(409).json("Email déjà utilisé");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword, company });

        const generatedToken = base64encode(JSON.stringify({
            id: user._id,
            email: email
        }));

        user.token = generatedToken;
        await user.save();

        await Campaign.create({
            name: `${company}_campagne`,
            description: `Campagne de ${company}`,
            owner: user._id
        });

        sendRegisterEmail({ email, hash: generatedToken });

        res.status(201).json(user);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json("Erreur lors de la création de l'utilisateur");
    }
};


exports.validateToken = async (req, res) => {
    const { token } = req.body;

    try {
        const data = JSON.parse(base64decode(token));
        const user = await User.findOne({ _id: data.id });

        if (!user) {
            return res.status(404).json("Cet utilisateur n'existe pas");
        }

        if (user.email !== data.email) {
            return res.status(401).json("Token de validation non valide");
        }

        const isValid = bcrypt.compareSync(user.token, token);

        if (!isValid) {
            return res.status(401).json("Token de validation non valide");
        }

        user.active = true;
        await user.save();

        res.status(200).json("Token validé avec succès");
    } catch (error) {
        console.error("Erreur lors de la validation de votre token", error);
        res.status(500).json("Erreur lors de la validation de votre token");
    }
};

exports.getSession = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json("Vous n'êtes pas connecté");
    }

    const token = authHeader.split(' ')[1];
    const { payload, expired } = VerifyJWT(token);

    if (expired || !payload) {
        return res.status(401).json("Token expiré ou invalide");
    }

    res.status(200).json(payload);
};
