const mongoose = require('mongoose');

//Définition du model de données pour les recettes
const recetteSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.ObjectId, auto: true },
    name: { type: String, required: true, default: '' },
    description: { type: String, default: '' },
    ingredients: { type: [String], default: [] },
    instructions: { type: [String], default: [] },
    preparationTime: { type: Number, default: 0 }, // en minutes
    cookingTime: { type: Number, default: 0 }, // en minutes
    servings: { type: Number, default: 1 }, // nombre de portions
    difficulty: { 
        type: String, 
        enum: ['facile', 'moyen', 'difficile'],
        default: 'facile'
    },
    category: { type: String, default: '' }, // entrée, plat principal, dessert, etc.
    origin: { type: String, default: '' },
    isSpicy: {
        type: Boolean,
        default: false,
        set: function(value) {
            if (value === "on" || value === "true" || value === true) return true;
            if (value === "off" || value === "false" || value === false || value === undefined) return false;
            return Boolean(value);
        }
    },
    isVegetarian: {
        type: Boolean,
        default: false,
        set: function(value) {
            if (value === "on" || value === "true" || value === true) return true;
            if (value === "off" || value === "false" || value === false || value === undefined) return false;
            return Boolean(value);
        }
    },
    image: { type: String, default: '' },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null
    }
}, {
    timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

//Création du modèle de données Recette qui sera utilisé pour interagir avec la collection "recettes" dans MongoDB 
//Le modèle est lié au schéma défini ci-dessus
//le modèle est donc reliée à la base de données MongoDB à cette étape

module.exports = mongoose.model('Recette', recetteSchema);
