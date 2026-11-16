const mongoose = require('mongoose');
const Article = require('./models/Article');
const connectDB = require('./database/database');

// Données d'exemple pour les produits locaux de la boutique
const articlesData = [
    {
        name: "Rhum arrangé Ananas-Vanille",
        origin: "Martinique",
        isSpicy: false,
        isVegetarian: true,
        description: "Rhum blanc agricole macéré avec de l'ananas frais et des gousses de vanille bourbon. Bouteille de 50cl, 45°.",
        price: 28.00,
        ingredients: ["Rhum blanc agricole", "Ananas frais", "Vanille bourbon", "Sucre de canne"],
        image: "/rhum-arrange.jpg",
        category: "spiritueux",
        isAvailable: true
    },
    {
        name: "Sauce chien maison",
        origin: "Guadeloupe",
        isSpicy: true,
        isVegetarian: true,
        description: "Sauce créole traditionnelle à base d'oignons, piments et herbes fraîches. Parfaite pour accompagner grillades et poissons. Pot de 200ml.",
        price: 8.50,
        ingredients: ["Oignons", "Piments antillais", "Ciboulette", "Persil", "Citron vert", "Huile d'olive"],
        image: "/sauce-chien.jpg",
        category: "condiment",
        isAvailable: true
    },
    {
        name: "Gâteau Mont-Blanc coco",
        origin: "Antilles",
        isSpicy: false,
        isVegetarian: true,
        description: "Délicieux gâteau traditionnel antillais à la noix de coco râpée et à la vanille. Fait maison, portion individuelle.",
        price: 4.50,
        ingredients: ["Noix de coco râpée", "Farine", "Œufs", "Sucre", "Vanille", "Beurre"],
        image: "/gateau-montblanc.jpg",
        category: "pâtisserie",
        isAvailable: true
    },
    {
        name: "Épices Colombo mélange",
        origin: "Antilles",
        isSpicy: true,
        isVegetarian: true,
        description: "Mélange d'épices traditionnel pour préparer le colombo antillais. Curcuma, coriandre, fenugrec et autres épices. Sachet de 50g.",
        price: 6.00,
        ingredients: ["Curcuma", "Coriandre", "Fenugrec", "Cumin", "Gingembre", "Piment", "Ail"],
        image: "/epices-colombo.jpg",
        category: "épices",
        isAvailable: true
    },
    {
        name: "Confit de banane au rhum",
        origin: "Martinique",
        isSpicy: false,
        isVegetarian: true,
        description: "Bananes confites au rhum vieux et épices douces. Parfait pour les desserts ou à déguster seul. Pot de 250g.",
        price: 12.00,
        ingredients: ["Bananes", "Rhum vieux", "Sucre de canne", "Vanille", "Cannelle"],
        image: "/confit-banane.jpg",
        category: "conserve",
        isAvailable: true
    },
    {
        name: "Piment végétarien antillais",
        origin: "Guadeloupe",
        isSpicy: true,
        isVegetarian: true,
        description: "Condiment épicé à base de légumes marinés et piments forts. Bocal de 180g, préparation artisanale.",
        price: 9.50,
        ingredients: ["Piments forts", "Carottes", "Haricots verts", "Vinaigre", "Huile", "Épices"],
        image: "/piment-vege.jpg",
        category: "condiment",
        isAvailable: true
    },
    {
        name: "Sirop de canne artisanal",
        origin: "La Réunion",
        isSpicy: false,
        isVegetarian: true,
        description: "Sirop pur de canne à sucre, idéal pour parfumer desserts, cocktails et ti-punch. Bouteille de 25cl.",
        price: 7.50,
        ingredients: ["Canne à sucre", "Eau"],
        image: "/sirop-canne.jpg",
        category: "sirop",
        isAvailable: true
    },
    {
        name: "Chocolat créole aux épices",
        origin: "Martinique",
        isSpicy: true,
        isVegetarian: true,
        description: "Tablette de chocolat noir 70% aux épices créoles : cannelle, muscade et piment doux. 100g.",
        price: 8.00,
        ingredients: ["Chocolat noir 70%", "Cannelle", "Muscade", "Piment doux", "Sucre de canne"],
        image: "/tablette-choco.jpg",
        category: "confiserie",
        isAvailable: true
    },
    {
        name: "Miel de fleurs tropicales",
        origin: "Guadeloupe",
        isSpicy: false,
        isVegetarian: true,
        description: "Miel artisanal récolté sur les fleurs tropicales de Guadeloupe. Goût délicat et parfumé. Pot de 250g.",
        price: 15.00,
        ingredients: ["Miel de fleurs tropicales"],
        image: "/miel.jpg",
        category: "miel",
        isAvailable: true
    },
    {
        name: "Punch au coco",
        origin: "Martinique",
        isSpicy: false,
        isVegetarian: true,
        description: "Liqueur créole à base de rhum, lait de coco et épices douces. 18°, bouteille de 50cl.",
        price: 22.00,
        ingredients: ["Rhum blanc", "Lait de coco", "Sucre de canne", "Vanille", "Cannelle"],
        image: "/punch-coco.jpg",
        category: "spiritueux",
        isAvailable: true
    }
];

// Fonction pour initialiser les articles
async function initArticles() {
    try {
        // Connexion à la base de données
        await connectDB();
        
        // Supprimer tous les articles existants
        await Article.deleteMany({});
        console.log('Articles existants supprimés');
        
        // Insérer les nouveaux articles
        const articles = await Article.insertMany(articlesData);
        console.log(`${articles.length} articles créés avec succès`);
        
        // Afficher les articles créés
        articles.forEach(article => {
            console.log(`- ${article.name} (${article.price}€) - ${article.category}`);
        });
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des articles:', error);
    } finally {
        // Fermer la connexion à la base de données
        await mongoose.connection.close();
        console.log('Connexion à la base de données fermée');
    }
}


// Exporter la fonction pour pouvoir l'utiliser dans d'autres fichiers
module.exports = initArticles;

// Exécuter la fonction si le fichier est appelé directement
if (require.main === module) {
    initArticles();
}
