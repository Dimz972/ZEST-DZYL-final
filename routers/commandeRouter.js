const express = require("express");
const router = express.Router();
const { isAuthJwt, isAdminAuthenticated } = require("../middlewares/Auth"); // Importation du middleware pour vérifier l'authentification admin
const Commande = require("../models/Commande"); // Importation du modèle Commande
const commandeController = require("../controllers/commandeController");

//Route pour afficher la page de commande
router.get("/commande", isAuthJwt, commandeController.index);

//Route pour traiter la soumission du formulaire de commande
router.post("/commande/confirm", isAuthJwt, commandeController.create);

//Route pour afficher la page de paiement
router.get("/paiement", isAuthJwt, commandeController.paymentPage);

//Route pour traiter le paiement
router.post("/paiement", isAuthJwt, commandeController.processPayment);

//Route pour afficher la page de confirmation
router.get("/confirmation", isAuthJwt, commandeController.confirmationPage);

//Route pour afficher la page de la commande en cours
router.get("/commande/en-cours", isAuthJwt, commandeController.currentOrder);

//Route pour annuler la commande en cours
router.post("/commande/annuler", isAuthJwt, commandeController.annulerCommande);


//Routes admin des commandes
//Route pour afficher la gestion des commandes (admin uniquement)
router.get("/commandes/admin", isAdminAuthenticated, commandeController.orderManagementAdmin);

//Route pour vider l'historique des commandes terminées uniquement
router.post("/commande/historique/clear", isAdminAuthenticated, commandeController.clearCompletedOrders);

//Route pour mettre à jour le statut d'une commande (admin uniquement)
router.post("/commande/statut/:id", isAdminAuthenticated, commandeController.updateOrderStatus);

// Exporter le router au lieu de démarrer le serveur
module.exports = router;
