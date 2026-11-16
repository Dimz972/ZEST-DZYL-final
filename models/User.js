const express = require('express');
const mongoose = require('mongoose');

//Définition du model de données pour les utilisateurs
const userSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.ObjectId, auto: true },
     fname: {
        type: String,
        required: [true, 'Le prénom est obligatoire'],
        minlength: [3, 'Le prénom doit contenir au moins 3 caractères'],
        maxlength: [20, 'Le prénom ne peut pas dépasser 20 caractères'],
    },
    lname: String,
    email: String,
    phone_number: Number,
    adresse: String,
    password: {
        type: String,
        required: [true, 'Le mot de passe est obligatoire'],
        minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
        validate: [
            {
                validator: function(password) {
                    // Vérifier qu'il y a au moins une majuscule
                    return /[A-Z]/.test(password);
                },
                message: 'Le mot de passe doit contenir au moins une majuscule'
            },
            {
                validator: function(password) {
                    // Vérifier qu'il y a au moins un chiffre
                    return /[0-9]/.test(password);
                },
                message: 'Le mot de passe doit contenir au moins un chiffre'
            },
            {
                validator: function(password) {
                    // Vérifier qu'il y a au moins un caractère spécial
                    return /[\W_]/.test(password);
                },
                message: 'Le mot de passe doit contenir au moins un caractère spécial'
            }
        ]
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

//Création du modèle de données User qui sera utilisé pour interagir avec la collection "users" dans MongoDB 
//Le modèle est lié au schéma défini ci-dessus
//le modèle est donc reliée à la base de données MongoDB à cette étape

module.exports = mongoose.model('User', userSchema);



