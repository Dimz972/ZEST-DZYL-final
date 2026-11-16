const mongoose = require('mongoose');

// Définition du modèle de données pour les articles
const articleSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.ObjectId, auto: true },
    
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    origin: {
        type: String,
        required: false,
        default: ''
    },
    isSpicy: {
        type: Boolean,
        default: false
    },
    isVegetarian: {
        type: Boolean,
        default: false
    },
    description: { 
        type: String, 
        required: false,
        default: ''
    },
    price: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    ingredients: [{ 
        type: String 
    }],
    image: { 
        type: String, 
        required: false,
        default: ''
    },
    category: { 
        type: String, 
        required: false,
        default: 'general'
    },
    isAvailable: { 
        type: Boolean, 
        default: true 
    }
}, {
    timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Export du modèle
module.exports = mongoose.model('Article', articleSchema);
