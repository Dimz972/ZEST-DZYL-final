const mongoose = require('mongoose');
const Plat = require('./models/Plat');
const connectDB = require('./database/database');

// Données d'exemple pour les plats
const platsData = [
    {
        name: "Bokit au poulet",
        origin: "Guadeloupe",
        isSpicy: false,
        isVegetarian: false,
        description: "Pain frit traditionnel garni de poulet mariné aux épices, accompagné de salade fraîche, tomates, concombre et sauce créole maison. Un incontournable de la street food guadeloupéenne.",
        price: 8.50,
        ingredients: ["Pain à bokit", "Poulet mariné", "Salade", "Tomates", "Concombre", "Sauce créole", "Épices antillaises"],
        image: "/bokit-poulet.png"
    },
    {
        name: "Rougail saucisse",
        origin: "La Réunion",
        isSpicy: true,
        isVegetarian: false,
        description: "Plat emblématique de la cuisine réunionnaise composé de saucisses fumées mijotées dans une sauce tomate épicée au gingembre et piment. Servi avec du riz blanc parfumé.",
        price: 12.00,
        ingredients: ["Saucisses fumées", "Tomates", "Oignons", "Ail", "Gingembre", "Piment oiseau", "Thym", "Laurier", "Riz blanc"],
        image: "/rougail-saucisse.png"
    },
    {
        name: "Accras de morue",
        origin: "Antilles",
        isSpicy: true,
        isVegetarian: false,
        description: "Délicieux beignets de morue dessalée et émiettée, parfumés aux herbes fraîches et piment antillais. Croustillants à l'extérieur, moelleux à l'intérieur. Parfaits pour l'apéritif.",
        price: 6.50,
        ingredients: ["Morue dessalée", "Farine", "Œufs", "Piment antillais", "Ciboulette", "Persil", "Ail", "Lait"],
        image: "/accras-morue.png"
    },
    {
        name: "Colombo de légumes",
        origin: "Antilles",
        isSpicy: true,
        isVegetarian: true,
        description: "Curry végétarien aux saveurs des îles, mijoté avec un mélange d'épices colombo traditionnel. Riche en légumes de saison et lait de coco onctueux. Un plat complet et savoureux.",
        price: 10.00,
        ingredients: ["Courgettes", "Aubergines", "Pommes de terre", "Courge butternut", "Épices colombo", "Lait de coco", "Oignons", "Gingembre", "Ail"],
        image: "/colombo-legume.png"
    },
    {
        name: "Blaff de poisson",
        origin: "Martinique",
        isSpicy: true,
        isVegetarian: false,
        description: "Poisson frais du jour poché dans un court-bouillon parfumé au citron vert, thym, laurier et piment. Une préparation simple qui sublime la fraîcheur du poisson martiniquais.",
        price: 15.00,
        ingredients: ["Poisson frais du jour", "Citron vert", "Piment", "Thym", "Laurier", "Oignons", "Ail", "Gingembre", "Persil"],
        image: "/blaff-poisson.png"
    },
    {
        name: "Salade de christophine",
        origin: "Antilles",
        isSpicy: false,
        isVegetarian: true,
        description: "Salade fraîche et croquante de christophine râpée, assaisonnée d'une vinaigrette créole au citron vert et herbes fraîches. Un accompagnement léger et rafraîchissant.",
        price: 7.00,
        ingredients: ["Christophine", "Huile d'olive", "Vinaigre de cidre", "Citron vert", "Ciboulette", "Persil", "Oignons"],
        image: "/salade-christophine.jpg"
    },
    {
        name: "Carry de porc aux haricots rouges",
        origin: "La Réunion",
        isSpicy: true,
        isVegetarian: false,
        description: "Plat traditionnel réunionnais où le porc tendre se marie parfaitement avec les haricots rouges dans une sauce épicée au curcuma et massalé. Servi avec du riz blanc.",
        price: 13.50,
        ingredients: ["Porc", "Haricots rouges", "Oignons", "Ail", "Gingembre", "Curcuma", "Massalé", "Tomates", "Piment", "Riz"],
        image: "/carry-porc.jpg"
    },
    {
        name: "Gratin de christophine",
        origin: "Antilles",
        isSpicy: false,
        isVegetarian: true,
        description: "Gratin onctueux de christophine en lamelles, nappé d'une béchamel parfumée à la muscade et gratinée au fromage. Un accompagnement gourmand et réconfortant.",
        price: 8.00,
        ingredients: ["Christophine", "Beurre", "Farine", "Lait", "Fromage râpé", "Muscade", "Sel", "Poivre"],
        image: "/gratin-christophine.jpg"
    },
    {
        name: "Poulet boucané",
        origin: "Martinique",
        isSpicy: true,
        isVegetarian: false,
        description: "Poulet mariné aux épices créoles puis grillé au feu de bois pour un goût fumé authentique. Accompagné de légumes pays et riz créole parfumé.",
        price: 14.00,
        ingredients: ["Poulet fermier", "Épices créoles", "Citron vert", "Ail", "Gingembre", "Piment", "Légumes pays", "Riz créole"],
        image: "/poulet-boucane.jpg"
    },
    {
        name: "Lambi grillé",
        origin: "Guadeloupe",
        isSpicy: true,
        isVegetarian: false,
        description: "Lambi tendre grillé aux épices antillaises, accompagné d'une sauce chien piquante et de légumes grillés. Une spécialité de fruits de mer des Caraïbes.",
        price: 18.00,
        ingredients: ["Lambi", "Épices antillaises", "Sauce chien", "Piment", "Citron vert", "Persil", "Ciboulette", "Légumes grillés"],
        image: "/lambi-grille.jpg"
    }
];

// Fonction pour initialiser les plats
async function initPlats() {
    try {
        // Connexion à la base de données
        await connectDB();
        
        // Supprimer tous les plats existants
        await Plat.deleteMany({});
        console.log('Plats existants supprimés');
        
        // Insérer les nouveaux plats
        const plats = await Plat.insertMany(platsData);
        console.log(`${plats.length} plats créés avec succès`);
        
        // Afficher les plats créés
        plats.forEach(plat => {
            const spicyLabel = plat.isSpicy ? '🌶️' : '';
            const vegLabel = plat.isVegetarian ? '🌱' : '';
            console.log(`- ${plat.name} (${plat.price}€) - ${plat.origin} ${spicyLabel}${vegLabel}`);
        });
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des plats:', error);
    } finally {
        // Fermer la connexion à la base de données
        await mongoose.connection.close();
        console.log('Connexion à la base de données fermée');
    }
}

// Exporter la fonction pour pouvoir l'utiliser dans d'autres fichiers
module.exports = initPlats;

// Exécuter la fonction si le fichier est appelé directement
if (require.main === module) {
    initPlats();
}