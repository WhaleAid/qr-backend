const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    image: String,
    hash: String,
    progress: String,
    status: String,
    status_reason: String,
    valid: Boolean,
    isModerated: {
        type: Boolean,
        default: false
    },
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign'
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Image', imageSchema);