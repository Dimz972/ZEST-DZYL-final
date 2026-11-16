const User = require('../models/User'); // Importation du modèle User
const jwt = require('jsonwebtoken'); // Importation de jsonwebtoken pour la gestion des tokens JWT
const bcrypt = require('bcrypt'); // Importation de bcrypt pour le hashage des mots de passe
const crypto = require('crypto'); // Importation de crypto pour la génération de tokens
const sendEmail = require('../utils/sendEmail'); // Importation de la fonction d'envoi d'email
const { validatePasswordComplete } = require('../utils/passwordValidation'); // Importation de la validation de mot de passe
const { title } = require('process');
require('dotenv').config(); // Chargement des variables d'environnement depuis le fichier .env


// Constantes depuis .env
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) 
const ONE_HOUR = 60 * 60 * 1000; 


// Fonction helper pour obtenir l'URL de base de l'application
const appBase = (req) => `${req.protocol}://${req.get('host')}`;

//Controller pour crée un utilisateur via le formulaire => inscription avec vérification email
exports.create = async (req, res) => {
    try {
        const username = (req.body.fname || "").trim();
        const lname = (req.body.lname || "").trim();
        const email = (req.body.email || "").toLowerCase().trim();
        const { password, confirmPassword, phone_number, adresse } = req.body;

        if (!username || !email || !password || !confirmPassword)
            return res.status(400).render("pages/inscription", { 
                message: "Tous les champs obligatoires doivent être remplis", 
                title: "Inscription - ZEST' D'ZYL", 
                messageType: "error",
                formData: { fname: username, lname, email, phone_number, adresse }
            });

        // Validation complète du mot de passe
        const passwordValidation = validatePasswordComplete(password, confirmPassword);
        if (!passwordValidation.isValid) {
            let errorMessage = '';
            if (passwordValidation.passwordErrors.length > 0) {
                errorMessage = passwordValidation.passwordErrors.join(', ');
            }
            if (passwordValidation.matchError) {
                errorMessage += (errorMessage ? ', ' : '') + passwordValidation.matchError;
            }
            
            return res.render("pages/inscription", { 
                message: errorMessage, 
                title: "Inscription - ZEST' D'ZYL", 
                messageType: "error",
                formData: { fname: username, lname, email, phone_number, adresse }
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.render("pages/login", { 
                message: "Cet email est déjà utilisé. Connectez-vous.", 
                title: "Connexion - ZEST' D'ZYL", 
                messageType: "error",
                showResendLink: false
            });

        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const newUser = await User.create({
            fname: username,
            lname,
            email,
            password: hashedPassword,
            phone_number,
            adresse,
            role: 'user',
            isVerified: false,
        });

        // Token de vérification + ENCODAGE pour l'URL
        const verificationToken = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
        const base = appBase(req);
        const safe = encodeURIComponent(verificationToken);  // encode
        const verificationUrl = `${base}/users/verify/${safe}`;

        // Log et preview DEV
        console.log("🔗 Verification URL:", verificationUrl);

        await sendEmail({
            to: newUser.email,
            subject: "Vérifiez votre compte - ZEST'D'ZYL",
            html: `Bonjour ${username},<br><br>
                   Merci de vérifier votre compte en cliquant sur ce lien :
                   <a href="${verificationUrl}">Vérifier mon compte</a><br><br>
                   Ce lien est valable 7 jours.<br><br>
                   L'équipe ZEST'D'ZYL`,
        });

        res.render('pages/login', {
            message: "Inscription réussie ! Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre boîte mail.",
            messageType: "success",
            title: "Connexion - ZEST' D'ZYL",
            showResendLink: false
        });
    } catch (error) {
        console.error("Erreur lors de la création de compte :", error);
        
        // Gérer les erreurs de validation de Mongoose
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            const errorMessage = errors.join(', ');
            
            return res.status(400).render("pages/inscription", {
                message: errorMessage,
                title: "Inscription - ZEST' D'ZYL",
                messageType: "error",
                formData: { 
                    fname: req.body.fname || '', 
                    lname: req.body.lname || '', 
                    email: req.body.email || '', 
                    phone_number: req.body.phone_number || '', 
                    adresse: req.body.adresse || '' 
                }
            });
        }
        
        res.status(500).render("pages/inscription", {
            message: "Erreur serveur lors de la création du compte",
            title: "Inscription - ZEST' D'ZYL",
            messageType: "error",
            formData: { 
                fname: req.body.fname || '', 
                lname: req.body.lname || '', 
                email: req.body.email || '', 
                phone_number: req.body.phone_number || '', 
                adresse: req.body.adresse || '' 
            }
        });
    }
};

//Controller pour supprimer son compte utilisateur via le bouton "Supprimer mon compte" dans profil.ejs
exports.deleteAccount = async (req, res) => {
    try {
        //Récupération de l'ID de l'utilisateur à supprimer depuis les paramètres de la requête
        const userId = req.params.id;
        const deletedUser = await User.findByIdAndDelete(userId);
        console.log('Compte utilisateur supprimé:', deletedUser);
        req.session.destroy(); // Détruire la session de l'utilisateur
        res.clearCookie('token'); // Suppression du cookie contenant le token
        res.redirect('/users/login'); // Redirection vers la page de connexion après la suppression du compte
    } catch (error) {
        throw new Error('Error deleting user account: ' + error);
    }
};

//Controller pour afficher le formulaire d'ajout d'utilisateur
exports.form = async (req, res) => {
    try {
        res.status(200).render('pages/inscription', {
            title: "Inscription - ZEST' D'ZYL",
            message: null,
            messageType: null,
            formData: null
        });
    } catch (error) {
        console.error('Erreur lors de l\'affichage du formulaire :', error);
        res.status(500).send('Erreur lors de l\'affichage du formulaire');
    }
};

//Controller pour mettre à jour son profil via le bouton "Mettre à jour" dans profil.ejs
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.user._id; // Récupération de l'ID de l'utilisateur connecté
        const { fname, lname, email, phone_number, adresse, password, confirmPassword } = req.body;
        
        // Préparer les données à mettre à jour
        const updateData = { fname, lname, email, phone_number, adresse };
        
        // Hasher le mot de passe seulement s'il est fourni et non vide
        if (password && password.trim() !== '') {
            // Vérifier que les mots de passe correspondent
            if (password !== confirmPassword) {
                return res.status(400).send('Les mots de passe ne correspondent pas');
            }
            
            const { validatePassword } = require('../utils/passwordValidation');
            const passwordValidation = validatePassword(password);
            
            if (!passwordValidation.isValid) {
                return res.status(400).send(passwordValidation.errors.join(', '));
            }
            
            updateData.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true } // Retourne le document mis à jour
        );
        
        if (!updatedUser) {
            return res.status(404).send('Utilisateur non trouvé');
        }
        
        console.log('Profil utilisateur mis à jour:', updatedUser);
        req.session.user = updatedUser; // Mettre à jour la session avec les nouvelles données
        res.redirect('/users/profil'); // Redirection vers le profil de l'utilisateur
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).send('Erreur lors de la mise à jour du profil');
    }
};


//Système de login 
//Controller pour afficher le formulaire de connexion
exports.loginForm = (req, res) => {
    res.render('pages/login', { title: "Connexion - ZEST' D'ZYL", message: null, messageType: null, showResendLink: false }); // Affiche le formulaire de connexion
}

//Controller pour se login
exports.login = async (req, res) => {
    try {
           const {email, password} = req.body;
           const user = await User.findOne({email: email});
           
           if (!user) {
              return res.status(403).render('pages/login', { 
                   message: "Mot de passe ou email incorrect",
                   messageType: "error",
                   title: "Connexion - ZEST' D'ZYL",
                   showResendLink: false
               });
           }

           if (!user.isVerified) {
               return res.status(403).render('pages/login', { 
                   message: "Compte non vérifié. Veuillez vérifier votre email avant de vous connecter.",
                   messageType: "error",
                   title: "Connexion - ZEST' D'ZYL",
                   showResendLink: true
               });
           }

           // Comparaison du mot de passe fourni avec le hash stocké
           const isPasswordValid = await bcrypt.compare(password, user.password);
           
           if (isPasswordValid) {  
               req.session.user = user                    
               const token = jwt.sign({
                    sub: user._id,
                    fname: user.fname,
                    email: user.email } 
                    , JWT_SECRET, 
                    {expiresIn: JWT_EXPIRES_IN}); 
                    
                res.cookie("token", token, { httpOnly: true, secure: false }); // Stockage du token dans un cookie 
                   
                res.redirect("/users/profil");
           } else {
               return res.status(401).render('pages/login', { 
                   message: "Mot de passe ou email incorrect",
                   messageType: "error",
                   title: "Connexion - ZEST' D'ZYL",
                   showResendLink: false
               });
           }
       } catch (error) {
           console.error("Erreur lors de la connexion:", error);
           res.status(500).render('pages/login', {
               message: "Erreur serveur lors de la connexion",
               messageType: "error",
               title: "Connexion - ZEST' D'ZYL",
               showResendLink: false
           });
       }
};

//Controller pour afficher le profil de l'utilisateur connecté
exports.profil = (req, res) => {
      if (req.session.user) {
        res.render("pages/profil", {user: req.session.user, title: "Profil - ZEST' D'ZYL" }); // Affiche le profil de l'utilisateur connecté
    } else {
        res.redirect("/users/login");
    }
};

//Controller pour la déconnexion
exports.logout = (req, res) => {
    req.session.destroy();
    res.clearCookie('token'); // Suppression du cookie contenant le token
    res.redirect('/users/login'); // Redirection vers la page de connexion après la destruction de la session
};



//Controllers admin
//Controller pour les users coté admin afin de le modifier ou supprimer
exports.indexAdmin = async (req, res) => {
    try {
        
        const users = await User.find();
        console.log('Users trouvés:', users);
        
        const successMessage = req.session.successMessage;
        delete req.session.successMessage; // Supprimer le message après l'avoir lu
        
        res.status(200).render('pages/adminUser', { 
            users, 
            successMessage,
            title: "Administration Utilisateurs - ZEST' D'ZYL" 
        });
        //Réponse json api
        //res.status(200).json(plats);
        
    } catch (error) {
        throw new Error('Error retrieving user: ' + error);
    }
}

//Controller pour mettre à jour un utilisateur via le bouton "Mettre à jour" dans adminUser 
exports.formUpdate = async (req, res) => { 
     try {
        const userId = req.params.id;
        const { fname, lname, email, phone_number, adresse, password } = req.body;
        
        // Préparer les données à mettre à jour
        const updateData = { fname, lname, email, phone_number, adresse };
        
        // Hasher le mot de passe s'il est fourni et non vide
        if (password && password.trim() !== '') {
            const { validatePassword } = require('../utils/passwordValidation');
            const passwordValidation = validatePassword(password);
            
            if (!passwordValidation.isValid) {
                return res.status(400).send(passwordValidation.errors.join(', '));
            }
            
            updateData.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true } // Retourne le document mis à jour
        );
        
        if (!updatedUser) {
            return res.status(404).send('Utilisateur non trouvé');
        }
        
        console.log('Utilisateur mis à jour:', updatedUser);
        req.session.successMessage = "Utilisateur modifié avec succès !";
        res.redirect('/users/admin'); // Redirection vers la liste des utilisateurs
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        res.status(500).send('Erreur lors de la mise à jour de l\'utilisateur');
    }
};

//Controller pour supprimer un utilisateur via le bouton "Supprimer" dans la vue adminUser.e
exports.delete = async (req, res) => {
    try {
        //Récupération de l'ID de l'utilisateur à supprimer depuis les paramètres de la requête
        const userId = req.params.id;
        const deletedUser = await User.findByIdAndDelete(userId);
        console.log('Utilisateur supprimé:', deletedUser);
        res.redirect('/users/admin'); // Redirection vers la page admin après la suppression

    } catch (error) {
        throw new Error('Error deleting user: ' + error);
    }
};


//Controllers vérification email
//Controller pour vérifier si l'email est vérifié via le token
exports.verifyEmail = async (req, res) => {
    try {
        // Accepte /users/verify/:token OU /users/verify?token=...
        const tokenRaw = req.params.token || req.query.token || "";
        const token = decodeURIComponent(tokenRaw); // decode

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded?.id) return res.status(400).redirect("/users/login");

        const user = await User.findById(decoded.id);
        if (!user) return res.status(400).redirect("/users/login");
        if (user.isVerified) return res.status(200).redirect("/users/login");

        user.isVerified = true;
        await user.save();

        console.log(`✅ Compte vérifié pour: ${user.email}`);
        res.redirect("/users/login");
    } catch (error) {
        console.error("Erreur vérification email:", error);
        res.status(400).redirect("/users/login");
    }
};

//Controleur pour afficher le formulaire de renvoi d'email de vérification
exports.resendVerificationForm = (req, res) => {
    res.render('pages/resend-verification', { title: "Renvoyer l'email de vérification - ZEST' D'ZYL", message: null, messageType: null });
};

//Controller pour renvoyer l'email de vérification
exports.resendVerificationEmail = async (req, res) => {
    const email = (req.body.email || "").toLowerCase().trim();

    if (!email) {
        return res.status(400).render('pages/resend-verification', {
            title: "Renvoyer l'email de vérification - ZEST' D'ZYL",
            message: "Email requis.",
            messageType: "error"
        });
    }

    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.render('pages/login', {
                title: "Connexion - ZEST' D'ZYL",
                message: "Si un compte existe avec cet email, un nouveau lien de vérification a été envoyé.",
                messageType: "success",
                showResendLink: false
            });
        }
        
        if (user.isVerified) {
            return res.render('pages/login', {
                title: "Connexion - ZEST' D'ZYL",
                message: "Ce compte est déjà vérifié. Vous pouvez vous connecter.",
                messageType: "success",
                showResendLink: false
            });
        }

        const verificationToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
        const base = appBase(req);
        const safe = encodeURIComponent(verificationToken);
        const verificationUrl = `${base}/users/verify/${safe}`;

        console.log("🔗 Verification URL (resend):", verificationUrl);

        await sendEmail({
            to: user.email,
            subject: "Nouveau lien de vérification - ZEST'D'ZYL",
            html: `Bonjour ${user.fname},<br><br>
                   Voici un nouveau lien pour vérifier votre compte :
                   <a href="${verificationUrl}">Vérifier mon compte</a><br><br>
                   Ce lien est valable 7 jours.<br><br>
                   L'équipe ZEST'D'ZYL`,
        });

        res.render('pages/login', {
            title: "Connexion - ZEST' D'ZYL",
            message: "Un nouveau lien de vérification a été envoyé à votre adresse email.",
            messageType: "success",
            showResendLink: false
        });
    } catch (error) {
        console.error("Erreur lors du renvoi de l'email :", error);
        res.status(500).render('pages/resend-verification', {
            title: "Renvoyer l'email de vérification - ZEST' D'ZYL",
            message: "Erreur lors de l'envoi du lien de vérification.",
            messageType: "error"
        });
    }
};


//Controllers réinitialisation mot de passe
//Controller pour afficher le formulaire de demande de réinitialisation
exports.requestPasswordResetForm = (req, res) => {
    res.render('pages/forgot-password', { title: "Mot de passe oublié - ZEST' D'ZYL", message: null, messageType: null });
};

//Controller pour traiter la demande de réinitialisation (envoi email)
exports.requestPasswordReset = async (req, res) => {
    const email = (req.body.email || "").toLowerCase().trim();
    if (!email) {
        return res.status(400).render('pages/forgot-password', {
            title: "Mot de passe oublié - ZEST' D'ZYL",
            message: "Email requis.",
            messageType: "error"
        });
    }

    try {
        const user = await User.findOne({ email });
        
        // Toujours afficher le même message pour des raisons de sécurité
        if (!user) {
            return res.render('pages/login', {
                title: "Connexion - ZEST' D'ZYL",
                message: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
                messageType: "success",
                showResendLink: false
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHashed = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = resetTokenHashed;
        user.resetPasswordExpire = Date.now() + ONE_HOUR; // 1h
        await user.save();

        const base = appBase(req);
        const resetUrl = `${base}/users/reset-password/${resetToken}`;

        console.log("🔗 Reset URL:", resetUrl);

        await sendEmail({
            to: user.email,
            subject: "Réinitialisation du mot de passe - ZEST'D'ZYL",
            html: `<p>Bonjour ${user.fname},</p>
                   <p>Pour réinitialiser votre mot de passe, cliquez sur ce lien (valable 1h) :</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>
                   <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
                   <p>L'équipe ZEST'D'ZYL</p>`,
        });

        res.render('pages/login', {
            title: "Connexion - ZEST' D'ZYL",
            message: "Un lien de réinitialisation a été envoyé à votre adresse email.",
            messageType: "success",
            showResendLink: false
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('pages/forgot-password', {
            title: "Mot de passe oublié - ZEST' D'ZYL",
            message: "Erreur serveur lors de l'envoi de l'email.",
            messageType: "error"
        });
    }
};

//Controller pour afficher le formulaire de réinitialisation avec token
exports.resetPasswordForm = (req, res) => {
    const { token } = req.params;
    res.render('pages/reset-password', { token, title: "Réinitialiser le mot de passe - ZEST' D'ZYL", message: null, messageType: null });
};

//Controller pour traiter la réinitialisation du mot de passe
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
        return res.status(400).render('pages/reset-password', {
            token,
            title: "Réinitialiser le mot de passe - ZEST' D'ZYL",
            message: "Tous les champs sont obligatoires.",
            messageType: "error"
        });
    }
    
    // Validation complète du mot de passe
    const passwordValidation = validatePasswordComplete(password, confirmPassword);
    if (!passwordValidation.isValid) {
        let errorMessage = '';
        if (passwordValidation.passwordErrors.length > 0) {
            errorMessage = passwordValidation.passwordErrors.join(', ');
        }
        if (passwordValidation.matchError) {
            errorMessage += (errorMessage ? ', ' : '') + passwordValidation.matchError;
        }
        
        return res.status(400).render('pages/reset-password', {
            token,
            title: "Réinitialiser le mot de passe - ZEST' D'ZYL",
            message: errorMessage,
            messageType: "error"
        });
    }

    try {
        const resetTokenHashed = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken: resetTokenHashed,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).render('pages/forgot-password', {
                title: "Mot de passe oublié - ZEST' D'ZYL",
                message: "Token invalide ou expiré. Veuillez refaire une demande.",
                messageType: "error"
            });
        }

        user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        console.log(`✅ Mot de passe réinitialisé pour: ${user.email}`);
        
        res.render('pages/login', {
            title: "Connexion - ZEST' D'ZYL",
            message: "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
            messageType: "success",
            showResendLink: false
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('pages/reset-password', {
            token,
            title: "Réinitialiser le mot de passe - ZEST' D'ZYL",
            message: "Erreur serveur lors de la réinitialisation.",
            messageType: "error"
        });
    }
};






