const jwt = require('jsonwebtoken'); // Importation de jsonwebtoken pour la gestion des tokens JWT
require('dotenv').config(); // Chargement des variables d'environnement depuis le fichier .env


// Constantes depuis .env
const JWT_SECRET = process.env.JWT_SECRET;

//Fonctions pour vérifier l'authentification des utilisateurs admin
exports.isAdminAuthenticated = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.redirect('/users/profil'); // Redirection vers le profil utilisateur si non admin
}

//Fonction pour rediriger les utilisateurs déja loger vers leur profil
exports.redirectUserIfAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return res.redirect('/users/profil');
    }
    next();
} 

//Fonction pour vérifier l'authentification des utilisateurs via JWT
exports.isAuthJwt = async (req, res, next) => {
    const token = req.cookies.token; // Récupération du token depuis les cookies
    console.log("Token:", token); // Affichage du token dans la console pour débogage
    if (!token) {
        return res.redirect('/users/login'); // Redirection vers la page de connexion si le token n'est pas présent         
    }
    
    try {
        let decoded = await jwt.verify(token, JWT_SECRET); // Vérification du token avec la clé secrète
        console.log("Decoded:", decoded); // Affichage du contenu décodé du token pour débogage
        req.user = decoded; // Ajout des informations décodées à la requête
        next(); // Passe au middleware suivant ou à la route
    } catch (error) {
        console.log("Erreur JWT:", error.message); // Log de l'erreur pour débogage
        
        // Si le token a expiré ou est invalide, supprimer le cookie et rediriger
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            res.clearCookie('token'); // Supprimer le cookie du token expiré
            return res.redirect('/users/login?message=Session expirée, veuillez vous reconnecter');
        }
        
        // Pour toute autre erreur, rediriger également vers la page de connexion
        res.clearCookie('token');
        return res.redirect('/users/login');
    }
}

//Fonction pour vérifier si l'utilisateur est authentifié 
exports.isAuth =  (req, res, next)=>{
    if(!req.session.user) {
        return res.redirect("/users/login"); // Ajout du return
    }
    next()
}