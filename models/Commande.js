const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cart: [{
        type: {
            type: String,
            enum: ['plat', 'article'],
            required: true
        },
        plat: {
            _id: String,
            name: String,
            price: Number,
            image: String,
            description: String
        },
        article: {
            _id: String,
            name: String,
            price: Number,
            image: String,
            description: String,
            origin: String,
            isSpicy: Boolean,
            isVegetarian: Boolean,
            ingredients: [String]
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    user: {
        _id: String,
        fname: String,
        lname: String,
        email: String,
        phone_number: String,
        adresse: String
    },
    deliveryMethod: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: false // Pas obligatoire pour les commandes à emporter
    },
    phone: {
        type: String,
        required: true
    },
    notes: String,
    total: {
        type: Number,
        required: true
    },
    orderDate: {
        type: String,
        required: true
    },
    orderDisplayDate: {
        type: String,
        required: true
    },
    orderDisplayTime: {
        type: String,
        required: true
    },
    statut: {
        type: String,
        enum: ['en_cours', 'en_preparation', 'prete', 'terminee', 'livree', 'confirmee', 'annulee'],
        default: 'en_cours'
    },
    methodePaiement: {
        type: String,
        enum: ['card', 'cash'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Commande', commandeSchema);
