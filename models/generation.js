const mongoose = require('mongoose');

const generationSchema = new mongoose.Schema({
    text: String,
    valid: Boolean,
    isModerated: {
        type: Boolean,
        default: false
    },
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign'
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Generation', generationSchema);
