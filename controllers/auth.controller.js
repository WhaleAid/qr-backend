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
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json("Email ou mot de passe incorrect");
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(404).json("Email ou mot de passe incorrect");
        }

        req.session.user = { email: user.email, sessionId: req.session.id, role: user.role, id: user._id };
        const accessToken = SignJWT({ sessionId: req.session.id, email: email, role: user.role, id: user._id }, '30d');
        const refreshToken = SignJWT({ sessionId: req.session.id }, '1y');

        res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 2592000000, sameSite: 'Lax' });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 31536000000, sameSite: 'none' });

        res.status(200).json({
            accessToken,
            refreshToken,
            user: user
        });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json("Error logging in");
    }
}

exports.register = async (req, res) => {
    try {
        const { email, password, company } = req.body;
        if (!email || !password) {
            return res.status(400).json("Email ou mot de passe manquant");
        }
        if (!company) {
            return res.status(400).json("Renseignez le nom de votre entreprise");
        }

        const existingUser = await User.findOne({
            email: email
        });

        if (existingUser) {
            return res.status(409).json("Email déjà utilisé");
        }


        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword, company });
        const generatedToken = base64encode(toString({
            id: user._id,
            email: email
        }))
        user.token = generatedToken
        await user.save()
        await Campaign.create({
            name: `${company}_campagne`,
            description: `Campagne de ${company}`,
            owner: user._id
        })
        sendRegisterEmail({ email, hash: generatedToken })

        res.status(201).json(user);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json("Erreur lors de la création de l'utilisateur");
    }
}

exports.validateToken = async (res, req) => {
    const { token } = req.body

    const data = JSON.parse(base64decode(token))

    try {
        const user = await User.findOne({ _id: data.id })
        if (!user) {
            res.status(404).json("Cet utilisateur n'existe pas")
        }
        if (user.email !== data.email) {
            res.status(401).json("Token de validation non valid")
        }
        const isValid = bcrypt.compare(user.token, token)
        if (!isValid) {
            res.status(401).json("Token de validation non valid")
        }
        user.active = true
        await user.save()
    } catch (error) {
        res.status(500).json("Erreur lors de la validation de votre token")
        console.log('Validation token invalid')
    }
}

exports.logout = async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json("Déconnexion a échoué");
            }
            res.cookie('accessToken', '', { httpOnly: true, maxAge: 0 });
            res.cookie('refreshToken', '', { httpOnly: true, maxAge: 0 });
            res.status(200).json("Déconnecté");
        });
    } catch (error) {
        console.error("Error logging out:", error);
        res.status(500).json("Erreur lors de la déconnexion");
    }
}

exports.getSession = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json("Vous n'êtes pas connecté");
    }

    res.status(200).json(req.session.user);
}