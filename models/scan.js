const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
    generation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Generation'
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    },
    panelId: String,
    city: String,
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Scan', scanSchema);