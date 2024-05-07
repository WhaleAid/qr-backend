const { User } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { createSession, invalidateSession } = require('../services')
const { SignJWT, VerifyJWT } = require('../utils/jwt.utils')

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("Missing email or password");
    }

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).send("Invalid credentials");
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(404).send("Invalid credentials");
        }

        req.session.user = { email: user.email, sessionId: req.session.id };
        const accessToken = SignJWT({ sessionId: req.session.id, email: email }, '5s');
        const refreshToken = SignJWT({ sessionId: req.session.id }, '1y');

        res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 3000000 });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 31536000000 });

        res.status(200).send(VerifyJWT(accessToken).payload);
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send("Error logging in");
    }
}

exports.register = async (req, res) => {
    try {
        const { email, password, company } = req.body;
        if (!email || !password) {
            return res.status(400).send("Missing email or password");
        }
        if (!company) {
            return res.status(400).send("Missing company");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword, company });
        res.status(201).json(user);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Error creating user");
    }
}
exports.logout = async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Failed to logout");
        }
        res.cookie('accessToken', '', { httpOnly: true, maxAge: 0 });
        res.cookie('refreshToken', '', { httpOnly: true, maxAge: 0 });
        res.status(200).send("Logged out");
    });
}

exports.getSession = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Not logged in");
    }

    res.status(200).json(req.session.user);
}