const express = require('express');
const router = express.Router();
const multer = require('multer');
const eventController = require('../controllers/eventController');
const { isAuthJwt, isAdminAuthenticated } = require('../middlewares/Auth'); // Importation du middleware pour vérifier l'authentification admin


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

// Routes pour les événements

//Route pour afficher tous les événements (page publique)
router.get('/events', isAuthJwt, eventController.index);

//Route pour réserver une place à un événement
router.post('/events/reserve/:id', isAuthJwt, eventController.reserve);

//Route pour annuler l'inscription d'un utilisateur (côté utilisateur)
router.delete('/events/:eventId/cancel/:userId', isAuthJwt, eventController.cancelParticipant);

//Route pour vérifier la disponibilité d'un événement
router.get('/events/:id/availability', eventController.checkEventAvailability);

//Route pour obtenir les réservations d'un utilisateur pour un événement
router.get('/events/:eventId/user-reservations', isAuthJwt, eventController.getUserReservations);

//Route pour afficher les événements de l'utilisateur connecté
router.get('/events/en-cours', isAuthJwt, eventController.userEvents);

//Route pour obtenir les événements par catégorie
router.get('/events/category/:category', eventController.getEventsByCategory);


//Routes admin
//Route pour afficher tous les événements côté admin
router.get('/events/admin', isAdminAuthenticated, eventController.indexAdmin);

//Route pour créer un nouvel événement
router.post('/events/add', isAdminAuthenticated, uploadImage.single('image'), eventController.create);

//Route pour mettre à jour un événement
router.post('/events/update/:id', isAdminAuthenticated, uploadImage.single('image'), eventController.update);

//Route pour supprimer un événement
router.delete('/events/delete/:id', isAdminAuthenticated, eventController.delete);

//Route pour récupérer les participants d'un événement (admin)
router.get('/events/:id/participants', isAdminAuthenticated, eventController.getParticipants);

//Route pour annuler l'inscription d'un utilisateur à un événement
router.delete('/events/:eventId/participants/:userId', isAdminAuthenticated, eventController.removeParticipant);


module.exports = router;