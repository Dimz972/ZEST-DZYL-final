const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const userController = require('../controllers/userController');
const { isAdminAuthenticated, redirectUserIfAuthenticated, isAuthJwt } = require('../middlewares/Auth'); // Importation des middlewares






//Route pour crée un utilisateur via le formulaire d'inscription
router.post('/users/add', userController.create); // Utilisation du contrôleur pour ajouter un utilisateur) 

//Route pour supprimer son compte utilisateur via le bouton "Supprimer mon compte" dans profil.ejs
router.delete('/users/deleteAccount/:id', isAuthJwt, userController.deleteAccount); // Utilisation du contrôleur pour supprimer son compte utilisateur

//Route pour afficher le formulaire d'ajout d'utilisateur
router.get('/users/inscription', redirectUserIfAuthenticated , userController.form); // Affiche le formulaire pour ajouter un utilisateur


//Router pour mettre à jour son profil utilisateur via le formulaire de mise à jour dans profil.ejs
router.post('/users/updateProfile/:id', isAuthJwt, userController.updateProfile); // Utilisation du contrôleur pour mettre à jour son profil utilisateur


//Système de login
// Route pour afficher le formulaire de connexion
router.get("/users/login", redirectUserIfAuthenticated , userController.loginForm); // Affiche le formulaire de connexion

// Route pour gérer la connexion de l'utilisateur
router.post("/login", userController.login); // Utilisation du contrôleur pour gérer la connexion

// Route pour afficher le profil de l'utilisateur connecté
router.get("/users/profil", isAuthJwt, userController.profil); // Affiche le profil de l'utilisateur connecté

// Route pour la déconnexion => profil.ejs
router.get('/logout', isAuthJwt, userController.logout); // Utilisation du contrôleur pour gérer la déconnexion


//Routes admin
//Router pour afficher les utilisateurs côté admin (pour modifier ou supprimer)
router.get('/users/admin', isAdminAuthenticated, userController.indexAdmin); // Utilisation du contrôleur pour afficher

//Router pour mettre à jour un utilisateur via le formulaire de mise à jour coté admin
router.post('/users/update/:id', isAdminAuthenticated, userController.formUpdate);

//Routes pour supprimer un utilisateur via le bouton "Supprimer" dans la vue adminUser.ejs
router.delete('/users/delete/:id', isAdminAuthenticated, userController.delete); // Utilisation du contrôleur pour supprimer un utilisateur)



//Routes vérification email
// Route pour vérifier si l'email est vérifié via le token
router.get('/users/verify/:token', userController.verifyEmail);

// Route pour afficher le formulaire de renvoi d'email de vérification
router.get('/users/resend-verification', userController.resendVerificationForm);

// Route pour renvoyer l'email de vérification
router.post('/users/resend-verification', userController.resendVerificationEmail);



// Routes de réinitialisation du mot de passe
// Route pour afficher le formulaire de demande de réinitialisation
router.get('/users/forgot-password', userController.requestPasswordResetForm);

// Route pour traiter la demande de réinitialisation (envoi email)
router.post('/users/forgot-password', userController.requestPasswordReset);

// Route pour afficher le formulaire de réinitialisation avec token
router.get('/users/reset-password/:token', userController.resetPasswordForm);

// Route pour traiter la réinitialisation du mot de passe
router.post('/users/reset-password/:token', userController.resetPassword);






// Export du routeur
module.exports = router; 




