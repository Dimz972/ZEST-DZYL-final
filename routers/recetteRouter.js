const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const recetteController = require('../controllers/recetteController');
const { isAdminAuthenticated, redirectUserIfAuthenticated, isAuthJwt } = require('../middlewares/Auth'); // Importation des middlewares

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
    // Accepter les requêtes sans fichier (la validation se fera côté client)
    if (!file) {
        cb(null, true);
        return;
    }
    
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

// Route pour afficher la page des recettes (publique)
router.get('/recettes', recetteController.index);



// Routes admin
// Route pour afficher la page d'administration des recettes
router.get('/recettes/admin', isAdminAuthenticated, recetteController.indexAdmin);

// Route pour traiter l'ajout d'une nouvelle recette
router.post('/recettes/add', isAdminAuthenticated, uploadImage.single('image'), recetteController.create);

// Route pour supprimer une recette
router.delete('/recettes/:id', isAdminAuthenticated, recetteController.delete);

// Route pour mettre à jour une recette
router.post('/recettes/update/:id', isAdminAuthenticated, uploadImage.single('image'), recetteController.formUpdate);



// Route pour afficher les détails d'une recette spécifique, placé à la fin pour éviter les conflits de route
router.get('/recettes/:id', recetteController.show);


// Exporter le router
module.exports = router;