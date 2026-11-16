const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['nouveau', 'lu', 'traité', 'fermé'],
        default: 'nouveau'
    }
}, {
    timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

module.exports = mongoose.model('Contact', contactSchema);
