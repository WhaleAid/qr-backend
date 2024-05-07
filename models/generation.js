const mongoose = require('mongoose');

const generationSchema = new mongoose.Schema({
    text: String,
    panelId: String,
    valid: Boolean,
    image: String,
    isModerated: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Generation', generationSchema);
