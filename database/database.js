const mongoose = require('mongoose');
require('dotenv').config();

// Connexion à la base de données MongoDB Atlas
module.exports = async() => {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error('MONGODB_URI non définie dans le fichier .env');
        }

        await mongoose.connect(mongoUri);
        console.log('MongoDB Atlas connected successfully');
    }
    catch (error) {
        console.log('Error connecting to the database:', error);
    }
}