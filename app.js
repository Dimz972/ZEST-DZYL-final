require('dotenv').config(); // Chargement des variables d'environnement
const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser"); //importation du middleware cookie-parser pour gérer les cookies
const session = require("express-session"); //importation du middleware express-session pour gérer les sessions
const ejs = require("ejs"); //importation du moteur de template EJS
const connectDb = require("./database/database"); //importation de la connexion à la base de données
const Plat = require("./models/Plat"); //importation du modèle de données Employee
const User = require("./models/User"); //importation du modèle de données User
const Commande = require("./models/Commande"); //importation du modèle de données Commande
const bodyParser = require("body-parser"); //importation du middleware body-parser pour parser les données du corps de la requête
const mongoose = require("mongoose"); //importation de mongoose pour la connexion à MongoDB
const jwt = require("jsonwebtoken"); //importation de jsonwebtoken pour la gestion des tokens JWT
const expressLayouts = require("express-ejs-layouts"); //importation du middleware express-ejs-layouts pour gérer les layouts EJS
const helmet = require("helmet"); //importation du middleware helmet pour la sécurité des en-têtes HTTP

const userRouter = require("./routers/userRouter");
const platRouter = require("./routers/platRouter"); //importation du routeur userPlat
const articleRouter = require("./routers/articleRouter"); //importation du routeur article
const reservationRouter = require("./routers/reservationRouter"); //importation du routeur reservation
const commandeRouter = require("./routers/commandeRouter"); //importation du routeur commande
const recetteRouter = require("./routers/recetteRouter"); //importation du routeur recette
const eventRouter = require("./routers/eventRouter"); //importation du routeur event
const contactRouter = require("./routers/contactRouter"); //importation du routeur contact

const methodOverride = require("method-override"); //importation du middleware method-override pour gérer les méthodes HTTP PUT et DELETE

const host = process.env.HOST 
const port = process.env.PORT 

// Configuration de sécurité avec Helmet adaptée au projet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Nécessaire pour les scripts inline dans EJS
          "'unsafe-eval'", // Nécessaire pour certaines fonctionnalités JavaScript
          "https://cdn.jsdelivr.net/", // Pour Flowbite et autres CDN
          "https://cdnjs.cloudflare.com/" // Pour Font Awesome
        ],
        scriptSrcAttr: ["'unsafe-inline'"], // Permet les gestionnaires d'événements inline (onclick, onchange, etc.)
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Nécessaire pour Tailwind et styles inline
          "https://cdn.jsdelivr.net/", // Pour Flowbite CSS
          "https://cdnjs.cloudflare.com/" // Pour Font Awesome CSS
        ],
        fontSrc: [
          "'self'",
          "data:", // Pour les fonts en base64
          "https://cdnjs.cloudflare.com/", // Pour les fonts Font Awesome
          "https://fonts.gstatic.com/" // Pour Google Fonts (si utilisé)
        ],
        imgSrc: [
          "'self'", 
          "data:", // Pour les images en base64
          "blob:", // Pour les images uploadées
          "*" // Permet toutes les sources d'images (à ajuster selon vos besoins)
        ],
        connectSrc: [
          "'self'", // Pour les requêtes AJAX vers votre serveur
          "https://www.google.com/", // Pour Google Maps API si nécessaire
          "https://cdn.jsdelivr.net/" // Pour les source maps de Flowbite
        ],
        objectSrc: ["'none'"], // Désactive les objets pour la sécurité
        mediaSrc: ["'self'"], // Pour les fichiers média locaux
        frameSrc: [
          "'self'",
          "https://www.google.com/" // Pour Google Maps embed
        ],
        childSrc: [
          "'self'",
          "https://www.google.com/" // Pour Google Maps dans les iframes
        ],
        upgradeInsecureRequests: [], // Force HTTPS si disponible
      },
    },
    crossOriginEmbedderPolicy: false, // Désactivé pour éviter les problèmes avec les uploads
    frameguard: { action: 'sameorigin' }, // Permet l'embedding depuis le même domaine (pour Google Maps)
    hsts: {
      maxAge: 31536000, // 1 an en secondes
      includeSubDomains: true,
      preload: true
    },
    noSniff: true, // Empêche le MIME type sniffing
    xssFilter: true, // Protection XSS
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    },
    crossOriginOpenerPolicy: { policy: "same-origin" }, // Protection contre les attaques de type popup
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Permet le partage de ressources cross-origin contrôlé
    originAgentCluster: true // Isolation des origines pour plus de sécurité
  })
);

app.use(express.urlencoded({ extended: true }));

app.use(expressLayouts);
app.use(express.json());
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(methodOverride("_method")); // Utilisation de method-override pour gérer les méthodes PUT et DELETE
app.use(cookieParser()); // Utilisation du middleware cookie-parser pour gérer les cookies
app.use(
  session({
    saveUninitialized: false, // Ne pas sauvegarder les sessions non initialisées
    secret: "secret",
    resave: false, // Ne pas sauvegarder la session si elle n'a pas été modifiée
  })
);

// Middleware global pour rendre les variables user et cart disponibles dans tous les templates EJS
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.cart = req.session.cart || [];
  next();
});

app.set("view engine", "ejs");
app.set("views", "./views"); // Spécifie le dossier des vues

//Lancement du serveur
app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

//appel de la connection à la base de données
connectDb();


// Importation du routeur UserRouter
app.use(userRouter); // Utilisation du routeur pour les routes utilisateur

// Importation du routeur PlatRouter
app.use(platRouter); // Utilisation du routeur pour les routes plat

// Importation du routeur ArticleRouter
app.use(articleRouter); // Utilisation du routeur pour les routes article

//Route pour la page d'accueil
app.get("/", (req, res) => {
  res.render("pages/accueil", { title: "Accueil - ZEST' D'ZYL" }); // Affichage de la page d'accueil
});

//Route pour le dashboard admin
app.get("/dashboard/admin", (req, res) => {
  res.render("pages/dashboard", { title: "Dashboard Admin - ZEST' D'ZYL" }); // Affichage de la page dashboard admin
});

//Utilisation du routeur reservation
app.use(reservationRouter); // Utilisation du routeur pour les routes de réservation

//Utilisation du routeur commande
app.use(commandeRouter); // Utilisation du routeur pour les routes de commande

//Utilisation du routeur recette
app.use(recetteRouter); // Utilisation du routeur pour les routes de recette

//Utilisation du routeur event
app.use("/", eventRouter); // Utilisation du routeur pour les routes d'événements

//Utilisation du routeur contact
app.use(contactRouter); // Utilisation du routeur pour les routes de contact

//Route pour la page 404
// Ce middleware doit être placé après toutes les autres routes pour n'intercepter que les URLs non gérées
app.use((req, res, next) => {
  res.status(404).render("pages/404", { title: "404 - Page non trouvée" });
});


//COOKIES (stockage de données sur le navigateur)
// Route pour définir un cookie qui sera envoyé au navigateur et qui se stockera dans le navigateur => F12 > Application > Cookies
/* app.get('/set-cookie', (req, res) => {
    res.cookie("username", "Dimz", 
      {
      //httpOnly: true, // Le cookie ne sera accessible que par le serveur
      //maxAge: 3000, // Durée de vie du cookie en millisecondes
      //expires: new Date(Date.now() + 3000), // Date d'expiration du cookie 
    }
    
    )
    res.end('Cookie has been set!'); // Réponse pour indiquer que le cookie a été défini
});

// Route pour récupérer un cookie depuis le navigateur 
app.get('/get-cookie', (req, res) => {
  console.log(req.cookies); // Affiche les cookies dans la console
   res.end("Bonjour " + req.cookies.username); // Affiche le cookie "username" dans la réponse
});


//SESSION (stockage de données côté serveur)

app.get('/set-session', (req, res) => {
    req.session.isAdmin = true; // Définition d'une variable de session // { isAdmin: true }
    req.session.email = "admin@hotmail.fr"
    res.end("Session ouverte !"); // Réponse pour indiquer que la session est ouverte
});

app.get('/get-session', (req, res) => {
   res.write('<a href="/logout">Logout</a><br>'); // Lien pour voir les données de session
   res.end(`Bonjour, vous etes connecte en tant qu'admin : ${req.session.isAdmin} et votre email est : ${req.session.email}`); // Affiche les données de session dans la réponse
  
});

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/get-session'); // Redirection vers la page d'accueil après la destruction de la session
}); */

//JWT (JSON Web Token) - Authentification et autorisation
//Le JWT est un standard ouvert (RFC 7519) qui permet de transmettre des informations entre deux parties de manière sécurisée sous forme d'objet JSON. Il est souvent utilisé pour l'authentification et l'autorisation dans les applications web.
/*app.get('/jwt', (req, res) => {
    try {
        const token = jwt.sign({_id: 1234, role:'admin'},"xxxx",{expiresIn: '1h'}) //creation du token  
        // { _id: 1234, role: 'admin' } => payload du token  // "xxxx" => secret key pour signer le token // { expiresIn: '1h' } => durée de validité du token
        console.log(token); // Affichage du token dans la console

        const decoded = jwt.verify(token, "xxxx") //verification du token
        console.log(decoded); // Affichage du payload décodé dans la console


    } catch (error) {
        throw error;
    }
}); */

//MISE A JOUR DU 22:09/2023
