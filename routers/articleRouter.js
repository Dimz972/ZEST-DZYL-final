const express = require('express');
const router = express.Router();
const multer = require('multer');
const articleController = require('../controllers/articleController');
const { isAuthJwt, isAdminAuthenticated } = require('../middlewares/Auth');

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
    // Si aucun fichier n'est fourni, accepter la requête
    if (!file) {
        cb(null, true);
    } else if (file.mimetype.startsWith('image/')) {
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

// Routes pour les articles
// Route pour afficher la boutique avec les articles
router.get('/boutique', articleController.index);


// Routes pour le panier
// Route pour ajouter un article au panier
router.post('/articles/add-to-cart/:id', articleController.addToCart);

// Route pour supprimer un article du dropdown panier
router.delete('/panier/delete-article/:id', articleController.removeFromCart);

// Route pour supprimer un article depuis page panier.ejs
router.delete('/panier/delete-article-from-cart/:id', articleController.removePageCart);

// API pour récupérer le panier (articles uniquement)
router.get('/api/cart/articles', articleController.getCartAPI);


// Routes pour admin des articles
// Route pour afficher les articles dans l'admin
router.get('/articles/admin', isAdminAuthenticated, articleController.indexAdmin);

// Route pour créer un article
router.post('/articles/create', uploadImage.single('image'), isAdminAuthenticated, articleController.create);

// Route pour mettre à jour un article
router.post('/articles/update/:id', uploadImage.single('image'), isAdminAuthenticated, articleController.update);

// Route pour supprimer un article
router.post('/articles/delete/:id', isAdminAuthenticated, articleController.delete);

module.exports = router;
