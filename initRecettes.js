const mongoose = require('mongoose');
const Recette = require('./models/Recette');
const connectDB = require('./database/database');

// Données d'exemple pour les recettes
const recettesData = [
    {
        name: "Bokit traditionnel",
        description: "Recette authentique du bokit guadeloupéen, pain frit garni selon vos goûts",
        ingredients: [
            "500g de farine",
            "1 sachet de levure boulangère",
            "1 cuillère à café de sel",
            "1 cuillère à soupe de sucre",
            "30cl d'eau tiède",
            "Huile pour friture",
            "Garniture au choix (poulet, accras, légumes...)"
        ],
        instructions: [
            "Mélanger la farine, le sel, le sucre et la levure dans un saladier",
            "Ajouter progressivement l'eau tiède en mélangeant",
            "Pétrir la pâte jusqu'à obtenir une texture lisse et élastique",
            "Laisser lever la pâte 1h dans un endroit chaud",
            "Diviser la pâte en boules et étaler finement",
            "Faire frire dans l'huile chaude jusqu'à ce que ce soit doré",
            "Garnir avec vos ingrédients préférés"
        ],
        preparationTime: 30,
        cookingTime: 15,
        servings: 4,
        difficulty: "moyen",
        category: "plat principal",
        origin: "Guadeloupe",
        isSpicy: false,
        isVegetarian: false,
        image: "/bokit-poulet.png"
    },
    {
        name: "Rougail saucisse réunionnais",
        description: "Plat emblématique de la cuisine réunionnaise, savoureux et parfumé",
        ingredients: [
            "6 saucisses fumées",
            "4 tomates bien mûres",
            "2 oignons",
            "4 gousses d'ail",
            "1 morceau de gingembre frais",
            "2-3 piments oiseaux",
            "Huile",
            "Sel, poivre",
            "Thym, laurier"
        ],
        instructions: [
            "Éplucher et émincer finement les oignons",
            "Hacher l'ail et le gingembre",
            "Couper les tomates en dés",
            "Faire revenir les saucisses dans une poêle",
            "Retirer les saucisses et faire revenir les oignons",
            "Ajouter l'ail, le gingembre et les piments",
            "Incorporer les tomates et laisser mijoter 15 minutes",
            "Remettre les saucisses et cuire encore 10 minutes",
            "Servir avec du riz blanc"
        ],
        preparationTime: 20,
        cookingTime: 30,
        servings: 6,
        difficulty: "facile",
        category: "plat principal",
        origin: "La Réunion",
        isSpicy: true,
        isVegetarian: false,
        image: "/rougail-saucisse.png"
    },
    {
        name: "Accras de morue",
        description: "Délicieux beignets de morue épicés, parfaits pour l'apéritif",
        ingredients: [
            "300g de morue dessalée",
            "200g de farine",
            "2 oeufs",
            "20cl de lait",
            "1 piment antillais",
            "2 branches de ciboulette",
            "Persil",
            "1 gousse d'ail",
            "Huile pour friture"
        ],
        instructions: [
            "Dessaler la morue et l'émietter finement",
            "Préparer une pâte à beignet avec farine, oeufs et lait",
            "Hacher finement le piment, la ciboulette, le persil et l'ail",
            "Incorporer la morue et les herbes à la pâte",
            "Laisser reposer 30 minutes",
            "Faire chauffer l'huile à 180°C",
            "Former des petites boules de pâte avec une cuillère",
            "Frire jusqu'à coloration dorée",
            "Égoutter sur papier absorbant et servir chaud"
        ],
        preparationTime: 45,
        cookingTime: 20,
        servings: 6,
        difficulty: "moyen",
        category: "entrée",
        origin: "Antilles",
        isSpicy: true,
        isVegetarian: false,
        image: "/accras-morue.png"
    },
    {
        name: "Colombo de légumes",
        description: "Curry végétarien aux saveurs des îles, riche en légumes et épices",
        ingredients: [
            "2 aubergines",
            "2 courgettes",
            "3 pommes de terre",
            "1 courge butternut",
            "2 cuillères à soupe d'épices colombo",
            "400ml de lait de coco",
            "2 oignons",
            "3 gousses d'ail",
            "Gingembre frais",
            "Huile d'olive"
        ],
        instructions: [
            "Éplucher et couper tous les légumes en cubes",
            "Faire revenir les oignons dans l'huile",
            "Ajouter l'ail, le gingembre et les épices colombo",
            "Incorporer les légumes les plus durs en premier",
            "Verser le lait de coco et porter à ébullition",
            "Laisser mijoter 25-30 minutes",
            "Ajouter les légumes tendres en fin de cuisson",
            "Rectifier l'assaisonnement",
            "Servir avec du riz basmati"
        ],
        preparationTime: 25,
        cookingTime: 35,
        servings: 4,
        difficulty: "facile",
        category: "plat principal",
        origin: "Antilles",
        isSpicy: true,
        isVegetarian: true,
        image: "/colombo-legume.png"
    },
    {
        name: "Flan coco antillais",
        description: "Dessert traditionnel onctueux au lait de coco, parfumé à la vanille",
        ingredients: [
            "400ml de lait de coco",
            "150g de sucre",
            "4 oeufs entiers",
            "2 jaunes d'oeufs",
            "1 gousse de vanille",
            "100g de sucre pour le caramel",
            "3 cuillères à soupe d'eau"
        ],
        instructions: [
            "Préparer un caramel avec 100g de sucre et l'eau",
            "Verser le caramel dans le moule et réserver",
            "Faire chauffer le lait de coco avec la vanille",
            "Battre les oeufs avec le sucre restant",
            "Verser le lait chaud sur les oeufs en mélangeant",
            "Filtrer la préparation",
            "Verser dans le moule caramélisé",
            "Cuire au bain-marie 45 minutes au four à 160°C",
            "Laisser refroidir et démouler"
        ],
        preparationTime: 20,
        cookingTime: 45,
        servings: 6,
        difficulty: "moyen",
        category: "dessert",
        origin: "Antilles",
        isSpicy: false,
        isVegetarian: true,
        image: "/flan-coco.jpg"
    },
    {
        name: "Salade de christophine",
        description: "Salade fraîche et légère, parfaite comme entrée ou accompagnement",
        ingredients: [
            "2 christophines moyennes",
            "1 oignon",
            "2 branches de ciboulette",
            "Persil frais",
            "3 cuillères à soupe d'huile d'olive",
            "2 cuillères à soupe de vinaigre de cidre",
            "1 citron vert",
            "Sel, poivre"
        ],
        instructions: [
            "Éplucher et râper finement les christophines",
            "Saler légèrement et laisser dégorger 15 minutes",
            "Rincer et essorer dans un torchon",
            "Émincer finement l'oignon",
            "Hacher la ciboulette et le persil",
            "Préparer la vinaigrette avec huile, vinaigre et citron",
            "Mélanger tous les ingrédients",
            "Laisser mariner 30 minutes avant de servir",
            "Rectifier l'assaisonnement si nécessaire"
        ],
        preparationTime: 25,
        cookingTime: 0,
        servings: 4,
        difficulty: "facile",
        category: "entrée",
        origin: "Antilles",
        isSpicy: false,
        isVegetarian: true,
        image: "/salade-christophine.jpg"
    }
];

// Fonction pour initialiser les recettes
async function initRecettes() {
    try {
        // Connexion à la base de données
        await connectDB();
        
        // Supprimer toutes les recettes existantes
        await Recette.deleteMany({});
        console.log('Recettes existantes supprimées');
        
        // Insérer les nouvelles recettes
        const recettes = await Recette.insertMany(recettesData);
        console.log(`${recettes.length} recettes créées avec succès`);
        
        // Afficher les recettes créées
        recettes.forEach(recette => {
            console.log(`- ${recette.name} (${recette.difficulty}) - ${recette.category} - ${recette.preparationTime + recette.cookingTime} min`);
        });
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des recettes:', error);
    } finally {
        // Fermer la connexion à la base de données
        await mongoose.connection.close();
        console.log('Connexion à la base de données fermée');
    }
}

// Exporter la fonction pour pouvoir l'utiliser dans d'autres fichiers
module.exports = initRecettes;

// Exécuter la fonction si le fichier est appelé directement
if (require.main === module) {
    initRecettes();
}
