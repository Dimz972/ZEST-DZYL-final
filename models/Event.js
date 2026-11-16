const mongoose = require('mongoose');

// Définition du modèle de données pour les événements
const eventSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.ObjectId, auto: true },
    
    title: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    price: { 
        type: Number, 
        required: true,
        min: 0
    },
    category: {
        type: String,
        enum: ['atelier', 'degustation', 'festival', 'cours', 'brunch', 'soiree'],
        default: 'atelier'
    },
    maxParticipants: {
        type: Number,
        default: 20
    },
    currentParticipants: {
        type: Number,
        default: 0
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        registrationDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['confirmed', 'cancelled', 'pending'],
            default: 'confirmed'
        },
        notes: {
            type: String,
            trim: true
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    badge: {
        type: String,
        enum: ['populaire', 'nouveau', 'special', ''],
        default: ''
    },
    location: {
        type: String,
        default: 'Restaurant ZEST D\'ZYL'
    }
}, {
    timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Index pour optimiser les requêtes
eventSchema.index({ date: 1 });
eventSchema.index({ isActive: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);
