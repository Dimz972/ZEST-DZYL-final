
const express = require('express');
const router = express.Router();
const { isAuthJwt, isAdminAuthenticated} = require('../middlewares/Auth');
const reservationController = require('../controllers/reservationController');

//Route pour afficher la page de réservation
router.get('/reservation', isAuthJwt, reservationController.index);

//Route pour traiter la réservation
router.post('/reservation', isAuthJwt, reservationController.create);

// Route pour annuler sa propre réservation (utilisateur)
router.post('/reservation/annuler-ma-reservation/:id', isAuthJwt, reservationController.cancel);

// Route API pour vérifier la disponibilité (utile pour AJAX)
router.get('/reservation/api/disponibilite', reservationController.check);

//Router pour afficher la réservation en cours
router.get('/reservation/en-cours', isAuthJwt, reservationController.view);


//Routes admin
//Router pour voir toutes les réservations
router.get('/reservation/admin', isAdminAuthenticated, reservationController.viewAllReservations);

// Route pour annuler une réservation 
router.post('/reservation/annuler/:id', isAdminAuthenticated, reservationController.cancelReservationAdmin);

// Route pour supprimer définitivement une réservation
router.post('/reservation/delete/:id', isAdminAuthenticated, reservationController.deleteReservationAdmin);







module.exports = router;