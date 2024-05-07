const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
    generation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Generation'
    },
    city: String,
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Scan', scanSchema);