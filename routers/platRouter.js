const express = require('express');
const router = express.Router();
const Plat = require('../models/Plat');
const platController = require('../controllers/platController');
const multer = require('multer');
const { isAdminAuthenticated } = require('../middlewares/Auth'); // Importation du middleware pour vérifier l'authentification admin


// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Dossier où les images seront stockées
    },
    filename: function (req, file, cb) {
       cb(null, Date.now() + '-' + file.originalname); // Nom unique pour chaque fichier
    }
});

// Filtre pour accepter seulement les images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images sont autorisées!'), false);
    }
};

const uploadImage = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB
    }
});

//Routes pour récupérer tous les plats
router.get('/plats', platController.index); // Utilisation du contrôleur pour afficher tous les plats


//Route PANIER
// Route pour afficher le panier
router.get('/panier', platController.showCart); // Utilisation du contrôleur pour afficher le panier

// Route pour ajouter un plat au panier (AJAX POST)
router.post('/plats/add-to-cart/:id', platController.addToCart); // Utilisation du contrôleur pour ajouter un plat au panier

// Route pour supprimer un plat du panier
router.delete('/panier/delete-plat/:id', platController.removeFromCart); // Utilisation du contrôleur pour supprimer un plat du panier

// Route pour supprimer un plat du panier depuis la page panier
router.delete('/panier/delete-plat-from-cart/:id', platController.removePageCart); 

// Route API pour récupérer le panier en JSON
router.get('/api/cart', platController.getCartAPI); // API pour récupérer le panier


//Routes admin
//Routes pour afficher la page des plats côté admin (pour modifier ou supprimer)
router.get('/plats/admin', isAdminAuthenticated, platController.indexAdmin); // Utilisation du contrôleur pour afficher les plats côté admin

//Routes pour ajouter un plat via le modal dans adminPlat.ejs
router.post('/plats/add', isAdminAuthenticated, uploadImage.single('image'), platController.create); // Utilisation du contrôleur pour ajouter un plat

//Routes pour supprimer un plat via la page admin
router.delete('/plats/delete/:id', isAdminAuthenticated, platController.delete); // Utilisation du contrôleur pour supprimer un plat
 
//Route pour mettre à jour un plat via le modalUpdate dans plats.ejs
router.post('/plats/update/:id', isAdminAuthenticated, uploadImage.single('image'), platController.formUpdate); // Utilisation du contrôleur avec multer


// Exportation du routeur
module.exports = router;