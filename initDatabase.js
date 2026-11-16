const initArticles = require('./initArticles');
const initRecettes = require('./initRecettes');
const initPlats = require('./initPlats');
const initEvents = require('./initEvents');

// Script principal pour initialiser toutes les données
async function initializeDatabase() {
    console.log('🚀 Début de l\'initialisation de la base de données...\n');
    
    try {
        // Initialiser les articles
        console.log('📝 Initialisation des articles...');
        await initArticles();
        console.log('✅ Articles initialisés avec succès\n');
        
        // Attendre un peu avant la prochaine initialisation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Initialiser les recettes
        console.log('🍳 Initialisation des recettes...');
        await initRecettes();
        console.log('✅ Recettes initialisées avec succès\n');

        // Attendre un peu avant la prochaine initialisation
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Initialiser les plats
        console.log('🍽️ Initialisation des plats...');
        await initPlats();
        console.log('✅ Plats initialisés avec succès\n');

        // Attendre un peu avant la prochaine initialisation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Initialiser les événements
        console.log('🎉 Initialisation des événements...');
        await initEvents();
        console.log('✅ Événements initialisés avec succès\n');

        console.log('🎉 Initialisation de la base de données terminée avec succès !');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    }
}

// Exécuter l'initialisation si le fichier est appelé directement
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;
