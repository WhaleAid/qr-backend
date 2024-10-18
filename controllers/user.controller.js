const { User } = require("../models")
const { sendEmail } = require("../utils/email.utils")

exports.getMe = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email, _id: req.user.id }).select("-password -role -active");
        if (!user) {
            return res.status(404).json("Utilisateur introuvable");
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        res.status(500).json("Erreur lors de la récupération de l'utilisateur");
    }
}

exports.getAll = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' })
        if (!users) {
            return res.status(404).json("Utilisateurs non trouvés");
        }
        res.status(200).json(users);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        res.status(500).json("Erreur lors de la récupération des utilisateurs");
    }
}

exports.updateMe = async (req, res) => {
    const { company } = req.body

    try {
        const user = await User.findOne({ _id: req.user.id });
        if (!user) {
            return res.status(404).json("Utilisateur introuvable");
        }

        user.company = company
        await user.save()
        res.status(200).json("Profil mis à jour avec succès")
    } catch (error) {
        console.log("Erreur lors de la mise à jour de l'utilisateur")
        res.status(500).json("Erreur lors de la mise à jour de votre profil")
    }
}

exports.SendResetPasswordEmail = async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            res.status(404).json("Email introuvable")
        }
        // ! Send email with token
        sendEmail(email)
        res.status(200).json("Email envoyé")
    } catch (error) {
        console.log("Error while updating password")
        res.status(500).json("Erreur lors de la mis à jour de votre mot de passe")
    }

}

exports.updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body

    try {
        const user = await User.findOne({
            _id: req.body.id
        })

        const isPasswordValid = await user.comparePassword(oldPassword)

        if (!isPasswordValid) {
            return res.status(400).json("Mot de passe incorrect")
        }

        const hashedPassword = await bcrypt(password)
        user.password = hashedPassword

        await user.save()
        res.status(200).json("Mot de passe mis à jour")
    } catch (error) {
        console.log("Password update failed")
        res.status(500).json("Erreur lors de la mise à jour de votre mot de passe")
    }
}

// exports.updatePassword = async (req, res) => {
//     const { password, token } = req.body

//     try {
//         const user = await User.findOne({
//             email: req.user.email,
//             _id: req.body.id
//         })

//         // ! check if token is valid

//         // const hashedPassword = await bcrypt(password)
//         user.password = hashedPassword

//         await user.save()
//         res.status(200).json("Mot de passe mis à jour")
//     } catch (error) {
//         console.log("Password update failed")
//         res.status(500).json("Erreur lors de la mise à jour de votre mot de passe")
//     }
// }