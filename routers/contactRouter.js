const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const contactController = require('../controllers/contactController');
const { isAdminAuthenticated } = require('../middlewares/Auth');

//Route pour afficher la page contact
router.get('/contact', contactController.index);

//Route pour traiter la soumission du formulaire de contact
router.post('/contact', contactController.handleContactFormSubmission);


//Routes d'administration pour les contacts
//Route pour récupérer tous les messages de contact
router.get('/contacts/admin', isAdminAuthenticated, contactController.getAllContacts);

//Route pour marquer un message comme lu
router.patch('/admin/contacts/:id/read', isAdminAuthenticated, contactController.markAsRead);

//Route pour supprimer un message
router.delete('/admin/contacts/:id', isAdminAuthenticated, contactController.deleteContact);

// Exporter le router au lieu de démarrer le serveur
module.exports = router;


