const mongoose = require('mongoose');
const Event = require('./models/Event');
const connectDB = require('./database/database');

// Données des événements à insérer
const eventsData = [
    {
        title: "Atelier Cuisine Créole",
        description: "Apprenez à préparer les spécialités créoles authentiques avec notre chef. Découvrez les secrets du bokit, du colombo et d'autres délices des Antilles.",
        image: "/bokit.png",
        date: new Date("2025-11-15"),
        startTime: "14:00",
        endTime: "17:00",
        price: 45,
        category: "atelier",
        maxParticipants: 15,
        badge: "populaire",
        location: "Restaurant ZEST D'ZYL"
    },
    {
        title: "Soirée Dégustation Colombo",
        description: "Une soirée dédiée à la découverte du colombo sous toutes ses formes : poulet, porc, légumes. Accompagné d'un cocktail de bienvenue.",
        image: "/i71618-colombo-poulet.jpeg",
        date: new Date("2025-11-22"),
        startTime: "19:30",
        endTime: "22:30",
        price: 35,
        category: "degustation",
        maxParticipants: 20,
        badge: "",
        location: "Restaurant ZEST D'ZYL"
    },
    {
        title: "Festival du Bokit",
        description: "Une journée entière dédiée au bokit ! Dégustations, concours, animations et stands de producteurs locaux. Venez en famille !",
        image: "/recette-de-bokit-702x336.jpg",
        date: new Date("2025-11-05"),
        startTime: "12:00",
        endTime: "20:00",
        price: 25,
        category: "festival",
        maxParticipants: 50,
        badge: "nouveau",
        location: "Restaurant ZEST D'ZYL"
    },
    {
        title: "Cours de Pâtisserie Créole",
        description: "Apprenez à réaliser les desserts traditionnels créoles : flan coco, gâteau patate douce, et bien d'autres gourmandises sucrées.",
        image: "/logo ZEST D'ZYL.png",
        date: new Date("2025-11-12"),
        startTime: "10:00",
        endTime: "13:00",
        price: 40,
        category: "cours",
        maxParticipants: 12,
        badge: "",
        location: "Restaurant ZEST D'ZYL"
    },
    {
        title: "Brunch Tropical du Dimanche",
        description: "Un brunch à volonté avec les saveurs des îles : fruits tropicaux, spécialités locales et cocktails sans alcool. Parfait pour le dimanche en famille.",
        image: "/picture.jpeg",
        date: new Date("2025-11-09"),
        startTime: "11:00",
        endTime: "15:00",
        price: 28,
        category: "brunch",
        maxParticipants: 30,
        badge: "",
        location: "Restaurant ZEST D'ZYL"
    },
    {
        title: "Soirée Musicale & Gastronomie",
        description: "Une soirée exceptionnelle alliant musique live, danse et menu dégustation. Ambiance tropicale garantie avec des artistes locaux.",
        image: "/zest facade.png",
        date: new Date("2025-11-30"),
        startTime: "20:00",
        endTime: "00:00",
        price: 65,
        category: "soiree",
        maxParticipants: 40,
        badge: "special",
        location: "Restaurant ZEST D'ZYL"
    }
];

// Fonction pour initialiser les événements
const initEvents = async () => {
    try {
        // Connexion à la base de données
        await connectDB();
        
        // Vérifier si des événements existent déjà
        const existingEvents = await Event.countDocuments();
        
        if (existingEvents > 0) {
            console.log(`${existingEvents} événements existent déjà dans la base de données.`);
            
            // Optionnel : supprimer les anciens événements pour les remplacer
            // await Event.deleteMany({});
            // console.log('Anciens événements supprimés.');
            
            return;
        }

        // Insérer les nouveaux événements
        const insertedEvents = await Event.insertMany(eventsData);
        console.log(`${insertedEvents.length} événements ont été ajoutés à la base de données avec succès!`);
        
        // Afficher les événements créés
        insertedEvents.forEach(event => {
            console.log(`- ${event.title} (${event.date.toLocaleDateString('fr-FR')}) - ${event.price}€`);
        });

    } catch (error) {
        console.error('Erreur lors de l\'initialisation des événements:', error);
    } finally {
        // Fermer la connexion à la base de données
        await mongoose.connection.close();
        console.log('Connexion à la base de données fermée');
    }
};



// Exporter la fonction pour pouvoir l'utiliser dans d'autres fichiers
module.exports = initEvents;

// Exécuter la fonction si le fichier est appelé directement
if (require.main === module) {
    initEvents();
}
